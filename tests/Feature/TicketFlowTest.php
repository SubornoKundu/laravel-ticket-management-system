<?php

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Ticket::generateUidUsing(null);
    Cache::flush();
});

afterEach(function () {
    Ticket::generateUidUsing(null);
});

function validTicketPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Rahim Uddin',
        'email' => 'rahim@example.com',
        'phone' => '01700000000',
        'price' => '500',
        'message' => 'My order has not arrived.',
    ], $overrides);
}

function admin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

/* -------------------------------------------------------------------------
 | Submitting tickets
 * ---------------------------------------------------------------------- */

test('a guest can submit a ticket and lands on the confirmation page', function () {
    $response = $this->post(route('tickets.store'), validTicketPayload());

    $ticket = Ticket::firstOrFail();
    $response->assertRedirect(route('tickets.confirmation', $ticket->ticket_uid));

    expect($ticket->status->value)->toBe('pending')
        ->and($ticket->user_id)->toBeNull()
        ->and($ticket->ticket_uid)->toMatch('/^TKT-\d{8}-[2-9A-HJKMNP-Z]{10}$/');

    $this->get(route('tickets.confirmation', $ticket->ticket_uid))->assertOk();
});

test('a logged-in user submits a ticket that is linked to their account', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('tickets.store'), validTicketPayload());

    expect(Ticket::firstOrFail()->user_id)->toBe($user->id);
});

test('screenshots are stored on the configured disk and linked to the ticket', function () {
    Storage::fake('public');

    $this->post(route('tickets.store'), validTicketPayload([
        'screenshots' => [
            UploadedFile::fake()->image('a.png', 100, 100),
            UploadedFile::fake()->image('b.jpg', 100, 100),
        ],
    ]))->assertRedirect();

    $ticket = Ticket::with('screenshots')->firstOrFail();
    expect($ticket->screenshots)->toHaveCount(2);

    foreach ($ticket->screenshots as $shot) {
        Storage::disk('public')->assertExists($shot->path);
    }
});

test('a price too large for the database column is a validation error, not a 500', function () {
    $this->post(route('tickets.store'), validTicketPayload(['price' => '99999999999999999999']))
        ->assertSessionHasErrors('price');

    expect(Ticket::count())->toBe(0);
});

test('invalid submissions are rejected with validation errors', function () {
    $this->post(route('tickets.store'), [])->assertSessionHasErrors(['name', 'email', 'phone', 'message']);
    $this->post(route('tickets.store'), validTicketPayload([
        'screenshots' => [UploadedFile::fake()->create('big.png', 6000, 'image/png')],
    ]))->assertSessionHasErrors('screenshots.0');
    $this->post(route('tickets.store'), validTicketPayload([
        'screenshots' => [UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')],
    ]))->assertSessionHasErrors('screenshots.0');

    expect(Ticket::count())->toBe(0);
});

test('if the ticket cannot be saved, uploaded files are cleaned up', function () {
    Storage::fake('public');
    Ticket::generateUidUsing(fn () => throw new RuntimeException('boom'));

    $this->withoutExceptionHandling();

    try {
        $this->post(route('tickets.store'), validTicketPayload([
            'screenshots' => [UploadedFile::fake()->image('a.png')],
        ]));
        $this->fail('Expected the request to fail.');
    } catch (RuntimeException $e) {
        expect($e->getMessage())->toBe('boom');
    }

    expect(Storage::disk('public')->allFiles())->toBeEmpty()
        ->and(Ticket::count())->toBe(0);
});

/* -------------------------------------------------------------------------
 | Ticket IDs
 * ---------------------------------------------------------------------- */

test('ticket ids are unique across many tickets', function () {
    $uids = collect(range(1, 300))->map(fn () => Ticket::generateUid());

    expect($uids->unique()->count())->toBe(300);
});

test('an id collision is retried transparently instead of failing the request', function () {
    Ticket::factory()->create(['ticket_uid' => 'TKT-20260101-AAAAAAAAAA']);

    $ids = ['TKT-20260101-AAAAAAAAAA', 'TKT-20260101-AAAAAAAAAA', 'TKT-20260101-BBBBBBBBBB'];
    Ticket::generateUidUsing(function () use (&$ids) {
        return array_shift($ids);
    });

    $this->post(route('tickets.store'), validTicketPayload())->assertRedirect(
        route('tickets.confirmation', 'TKT-20260101-BBBBBBBBBB')
    );

    expect(Ticket::count())->toBe(2);
});

test('a persistent id collision eventually surfaces as an error instead of looping forever', function () {
    Ticket::factory()->create(['ticket_uid' => 'TKT-20260101-AAAAAAAAAA']);
    Ticket::generateUidUsing(fn () => 'TKT-20260101-AAAAAAAAAA');

    Ticket::createWithUniqueUid(['name' => 'x', 'email' => 'x@example.com', 'phone' => '1', 'message' => 'm'], 3);
})->throws(Illuminate\Database\UniqueConstraintViolationException::class);

/* -------------------------------------------------------------------------
 | Customer chat
 * ---------------------------------------------------------------------- */

test('chat messages come back oldest-first and only those after the cursor', function () {
    $ticket = Ticket::factory()->create();
    $first = $ticket->messages()->create(['sender_type' => 'customer', 'message' => 'one']);
    $second = $ticket->messages()->create(['sender_type' => 'customer', 'message' => 'two']);
    $third = $ticket->messages()->create(['sender_type' => 'customer', 'message' => 'three']);

    // Identical timestamps must not affect the order.
    TicketMessage::query()->update(['created_at' => '2026-01-01 00:00:00']);

    $all = $this->getJson(route('tickets.messages', $ticket->ticket_uid))->assertOk()->json('messages');
    expect(collect($all)->pluck('message')->all())->toBe(['one', 'two', 'three']);

    $newer = $this->getJson(route('tickets.messages', [$ticket->ticket_uid, 'after' => $first->id]))->json('messages');
    expect(collect($newer)->pluck('id')->all())->toBe([$second->id, $third->id]);

    $none = $this->getJson(route('tickets.messages', [$ticket->ticket_uid, 'after' => $third->id]))->json();
    expect($none['messages'])->toBe([])->and($none['has_more'])->toBeFalse();
});

test('the initial chat load is capped and returns the newest messages', function () {
    $ticket = Ticket::factory()->create();
    $rows = collect(range(1, TicketMessage::FEED_LIMIT + 25))->map(fn ($i) => [
        'ticket_id' => $ticket->id,
        'sender_type' => 'customer',
        'message' => "m{$i}",
        'created_at' => now(),
        'updated_at' => now(),
    ])->all();
    TicketMessage::insert($rows);

    $json = $this->getJson(route('tickets.messages', $ticket->ticket_uid))->json();

    expect($json['messages'])->toHaveCount(TicketMessage::FEED_LIMIT)
        ->and($json['has_more'])->toBeTrue()
        ->and(collect($json['messages'])->last()['message'])->toBe('m'.(TicketMessage::FEED_LIMIT + 25))
        ->and(collect($json['messages'])->first()['message'])->toBe('m26');
});

test('an unknown or malformed ticket id is a 404 for chat endpoints', function () {
    $this->getJson(route('tickets.messages', 'TKT-20260101-ZZZZZZZZZZ'))->assertNotFound();
    $this->postJson(route('tickets.sendMessage', 'TKT-20260101-ZZZZZZZZZZ'), ['message' => 'hi'])->assertNotFound();
    $this->getJson('/tickets/confirmation/x/messages')->assertNotFound();
});

test('a customer can send a chat message and an admin can see it', function () {
    $ticket = Ticket::factory()->create();

    $this->postJson(route('tickets.sendMessage', $ticket->ticket_uid), ['message' => 'Hello?'])
        ->assertOk()
        ->assertJsonPath('message.sender_type', 'customer');

    $this->actingAs(admin())
        ->getJson(route('admin.tickets.messages.index', $ticket))
        ->assertOk()
        ->assertJsonPath('messages.0.message', 'Hello?');
});

test('chat messages are validated', function () {
    $ticket = Ticket::factory()->create();

    $this->postJson(route('tickets.sendMessage', $ticket->ticket_uid), ['message' => ''])->assertUnprocessable();
    $this->postJson(route('tickets.sendMessage', $ticket->ticket_uid), ['message' => str_repeat('a', 2001)])->assertUnprocessable();
});

/* -------------------------------------------------------------------------
 | Rate limiting
 * ---------------------------------------------------------------------- */

test('visitors behind a proxy are limited individually, not all together', function () {
    // Each request comes from the same proxy (REMOTE_ADDR) but a different real client IP.
    foreach (range(1, 25) as $i) {
        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.1'])
            ->withHeader('X-Forwarded-For', "203.0.113.{$i}")
            ->post(route('tickets.store'), validTicketPayload())
            ->assertRedirect();
    }

    expect(Ticket::count())->toBe(25);
});

test('a single guest IP is still limited so it cannot flood the system', function () {
    $statuses = [];

    foreach (range(1, 302) as $i) {
        $statuses[] = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.1'])
            ->withHeader('X-Forwarded-For', '198.51.100.7')
            ->post(route('tickets.store'), validTicketPayload())
            ->getStatusCode();
    }

    expect(array_count_values($statuses))->toBe([302 => 300, 429 => 2]);
});

/* -------------------------------------------------------------------------
 | Cancelling
 * ---------------------------------------------------------------------- */

test('a customer can cancel a pending ticket', function () {
    $ticket = Ticket::factory()->create(['status' => 'pending']);

    $this->post(route('tickets.cancel', $ticket->ticket_uid))->assertRedirect();

    expect($ticket->refresh()->status->value)->toBe('cancelled');
});

test('a ticket already taken or successful cannot be self-cancelled', function () {
    $taken = Ticket::factory()->create(['status' => 'taken']);
    $successful = Ticket::factory()->create(['status' => 'successful']);

    $this->post(route('tickets.cancel', $taken->ticket_uid))->assertRedirect();
    $this->post(route('tickets.cancel', $successful->ticket_uid))->assertRedirect();

    expect($taken->refresh()->status->value)->toBe('taken')
        ->and($successful->refresh()->status->value)->toBe('successful');
});

test('a cancel racing an admin claim never overwrites the claim (conditional update, not read-then-write)', function () {
    $ticket = Ticket::factory()->create(['status' => 'pending']);

    // Simulate the admin's claim landing first.
    Ticket::whereKey($ticket->id)->update(['status' => 'taken']);

    $this->post(route('tickets.cancel', $ticket->ticket_uid))->assertRedirect();

    expect($ticket->refresh()->status->value)->toBe('taken');
});

test('the confirmation chat poll reports live status', function () {
    $ticket = Ticket::factory()->create(['status' => 'pending']);

    $this->getJson(route('tickets.messages', $ticket->ticket_uid))
        ->assertOk()
        ->assertJsonPath('status', 'pending');

    Ticket::whereKey($ticket->id)->update(['status' => 'successful']);

    $this->getJson(route('tickets.messages', $ticket->ticket_uid))
        ->assertJsonPath('status', 'successful');
});

/* -------------------------------------------------------------------------
 | Admin panel
 * ---------------------------------------------------------------------- */

test('the admin ticket list survives garbage filter input', function () {
    Ticket::factory()->count(3)->create();
    $this->actingAs(admin());

    foreach ([
        '',
        '?from=abc',
        '?to=31-31-2026',
        '?from[]=x',
        '?status=bogus&sort=zzz',
        '?search=%25%25',
        '?search=tkt-2026',
        '?from=2026-01-01&to=2026-12-31',
    ] as $query) {
        $this->get(route('admin.tickets.index').$query)->assertOk();
    }
});

test('the date filter includes the whole "to" day', function () {
    $this->actingAs(admin());
    Ticket::factory()->create(['created_at' => '2026-03-10 23:59:30']);
    Ticket::factory()->create(['created_at' => '2026-03-11 00:00:10']);

    $this->get(route('admin.tickets.index', ['from' => '2026-03-10', 'to' => '2026-03-10']))
        ->assertInertia(fn ($page) => $page->has('tickets.data', 1));
});

test('admin list stats count every status', function () {
    $this->actingAs(admin());
    Ticket::factory()->create(['status' => 'pending']);
    Ticket::factory()->count(2)->create(['status' => 'successful']);
    Ticket::factory()->create(['status' => 'taken']);

    $this->get(route('admin.tickets.index'))->assertInertia(fn ($page) => $page
        ->where('stats.total', 4)
        ->where('stats.pending', 1)
        ->where('stats.reserve', 0)
        ->where('stats.successful', 2)
        ->where('stats.taken', 1));
});

test('changing a status refreshes the counters immediately', function () {
    $admin = admin();
    $ticket = Ticket::factory()->create(['status' => 'pending']);

    $this->actingAs($admin)->get(route('admin.tickets.index'))
        ->assertInertia(fn ($page) => $page->where('stats.pending', 1));

    $this->actingAs($admin)->patch(route('admin.tickets.status', $ticket), ['status' => 'successful'])->assertRedirect();

    $this->actingAs($admin)->get(route('admin.tickets.index'))
        ->assertInertia(fn ($page) => $page->where('stats.pending', 0)->where('stats.successful', 1));
});

test('cancelled tickets are counted in the admin stats', function () {
    Ticket::factory()->create(['status' => 'cancelled']);

    $this->actingAs(admin())->get(route('admin.tickets.index'))
        ->assertInertia(fn ($page) => $page->where('stats.cancelled', 1)->where('stats.total', 1));
});

test('the first admin to take a ticket keeps it', function () {
    $adminA = admin();
    $adminB = admin();
    $ticket = Ticket::factory()->create(['status' => 'pending', 'assigned_admin_id' => null]);

    $this->actingAs($adminA)->patch(route('admin.tickets.status', $ticket), ['status' => 'taken'])->assertRedirect();
    $this->actingAs($adminB)->patch(route('admin.tickets.status', $ticket), ['status' => 'taken'])->assertRedirect();

    $ticket->refresh();
    expect($ticket->status->value)->toBe('taken')->and($ticket->assigned_admin_id)->toBe($adminA->id);
});

test('an invalid status is rejected', function () {
    $ticket = Ticket::factory()->create();

    $this->actingAs(admin())->patch(route('admin.tickets.status', $ticket), ['status' => 'nope'])
        ->assertSessionHasErrors('status');
});

test('regular users and guests cannot reach the admin panel', function () {
    $this->get(route('admin.tickets.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())->get(route('admin.tickets.index'))->assertForbidden();
});

/* -------------------------------------------------------------------------
 | Deployability
 * ---------------------------------------------------------------------- */

test('the route table can be cached (no closure routes)', function () {
    try {
        expect(Artisan::call('route:cache'))->toBe(0);
    } finally {
        Artisan::call('route:clear');
    }
});
