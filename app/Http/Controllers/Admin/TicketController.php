<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TicketController extends Controller
{
    private const STATS_CACHE_KEY = 'admin:ticket-stats';

    /** Seconds the summary counters may lag behind (they are re-computed instantly after a status change). */
    private const STATS_CACHE_TTL = 15;

    /**
     * Main admin page: paginated, filterable ticket list + summary stats.
     */
    public function index(Request $request): Response
    {
        $query = Ticket::query()->with(['screenshots', 'assignedAdmin', 'user:id,name,email']);

        if ($search = $request->string('search')->trim()->value()) {
            if (str_starts_with(strtoupper($search), 'TKT-')) {
                // Looks like a ticket ID: prefix match on the unique index instead
                // of scanning every row with a leading-wildcard LIKE.
                $query->where('ticket_uid', 'like', strtoupper($search).'%');
            } else {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('ticket_uid', 'like', "%{$search}%");
                });
            }
        }

        if ($status = $request->string('status')->value()) {
            if (in_array($status, array_column(TicketStatus::cases(), 'value'), true)) {
                $query->where('status', $status);
            }
        }

        // Range comparisons on the raw column (index-friendly) instead of
        // whereDate(), which wraps the column in DATE() and defeats the index.
        // An unparseable date (?from=abc) is ignored rather than causing a 500.
        if ($from = $this->parseDate($request->query('from'))) {
            $query->where('created_at', '>=', $from->startOfDay());
        }

        if ($to = $this->parseDate($request->query('to'))) {
            $query->where('created_at', '<=', $to->endOfDay());
        }

        // "id" as a tie-breaker: many tickets share the same second, and without
        // it pages can repeat or skip rows.
        $direction = $request->string('sort')->value() === 'oldest' ? 'asc' : 'desc';
        $query->orderBy('created_at', $direction)->orderBy('id', $direction);

        $tickets = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/Tickets', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status', 'from', 'to', 'sort']),
            'statusOptions' => TicketStatus::options(),
            'stats' => $this->stats(),
        ]);
    }

    /**
     * Change a ticket's status. Claiming ("taken") assigns the acting admin only
     * if nobody has claimed it yet — done as one conditional UPDATE so that two
     * admins clicking at the same instant can't both "win".
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(TicketStatus::class)],
        ]);

        DB::transaction(function () use ($ticket, $data) {
            Ticket::whereKey($ticket->getKey())->update(['status' => $data['status']]);

            if ($data['status'] === TicketStatus::Taken->value) {
                Ticket::whereKey($ticket->getKey())
                    ->whereNull('assigned_admin_id')
                    ->update(['assigned_admin_id' => Auth::id()]);
            }
        });

        rescue(fn () => Cache::forget(self::STATS_CACHE_KEY), report: false);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ticket status updated.')]);

        return back();
    }

    /**
     * JSON: fetch a ticket's chat thread. Polled by the frontend; pass
     * ?after=<last seen message id> to receive only newer messages.
     */
    public function messages(Request $request, Ticket $ticket): JsonResponse
    {
        $messages = TicketMessage::feedFor($ticket->getKey(), max(0, $request->integer('after')));

        return response()->json(
            ['messages' => $messages, 'has_more' => $messages->count() >= TicketMessage::FEED_LIMIT],
            200,
            ['Cache-Control' => 'no-store'],
        );
    }

    /**
     * JSON: admin sends a chat message on a ticket.
     */
    public function sendMessage(Request $request, Ticket $ticket): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $message = $ticket->messages()->create([
            'sender_type' => 'admin',
            'admin_id' => Auth::id(),
            'message' => $data['message'],
        ]);

        return response()->json([
            'message' => $message->load('admin:id,name'),
        ]);
    }

    /**
     * Summary counters (including cancelled). One GROUP BY query (served from
     * the `status` index), cached briefly, instead of six COUNT(*) queries on
     * every page load — the admin list also background-polls every few
     * seconds, so this runs far more often than a normal page view.
     *
     * @return array{total: int, pending: int, reserve: int, successful: int, taken: int, cancelled: int}
     */
    private function stats(): array
    {
        $compute = function (): array {
            $counts = DB::table('tickets')
                ->select('status', DB::raw('COUNT(*) as aggregate'))
                ->groupBy('status')
                ->pluck('aggregate', 'status');

            return [
                'total' => (int) $counts->sum(),
                'pending' => (int) ($counts[TicketStatus::Pending->value] ?? 0),
                'reserve' => (int) ($counts[TicketStatus::Reserve->value] ?? 0),
                'successful' => (int) ($counts[TicketStatus::Successful->value] ?? 0),
                'taken' => (int) ($counts[TicketStatus::Taken->value] ?? 0),
                'cancelled' => (int) ($counts[TicketStatus::Cancelled->value] ?? 0),
            ];
        };

        try {
            return Cache::remember(self::STATS_CACHE_KEY, self::STATS_CACHE_TTL, $compute);
        } catch (Throwable $e) {
            // A cache outage must never take the admin panel down.
            report($e);

            return $compute();
        }
    }

    private function parseDate(mixed $value): ?CarbonImmutable
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Date::parse($value)->toImmutable();
        } catch (Throwable) {
            return null;
        }
    }
}
