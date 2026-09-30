<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class TicketController extends Controller
{
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('tickets/Create', [
            'prefill' => $user ? ['name' => $user->name, 'email' => $user->email] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            // Column is DECIMAL(12,2): anything larger is rejected by MySQL with a 500.
            'price' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'message' => ['required', 'string', 'max:5000'],
            'screenshots' => ['nullable', 'array', 'max:5'],
            'screenshots.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'], // 5MB each
        ]);

        $disk = config('filesystems.ticket_disk', 'public');

        // 1) Files first: if storage fails the customer gets a clear message and
        //    nothing half-created is left in the database.
        $storedPaths = [];

        try {
            foreach ($request->file('screenshots', []) as $file) {
                $path = $file->store('ticket-screenshots', $disk);

                if ($path === false) {
                    throw new \RuntimeException('Screenshot could not be written to the storage disk.');
                }

                $storedPaths[] = $path;
            }
        } catch (Throwable $e) {
            $this->deleteStoredFiles($disk, $storedPaths);
            report($e);

            throw ValidationException::withMessages([
                'screenshots' => __('We could not save your screenshots. Please try again.'),
            ]);
        }

        // 2) Ticket + screenshot rows in one transaction: all or nothing.
        try {
            $ticket = DB::transaction(function () use ($request, $data, $storedPaths) {
                $ticket = Ticket::createWithUniqueUid([
                    'user_id' => $request->user()?->id,
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'price' => $data['price'] ?? 0,
                    'message' => $data['message'],
                    'status' => TicketStatus::Pending->value,
                ]);

                if ($storedPaths) {
                    $ticket->screenshots()->createMany(
                        array_map(fn (string $path) => ['path' => $path], $storedPaths)
                    );
                }

                return $ticket;
            });
        } catch (Throwable $e) {
            // Don't leave orphaned files behind if the database write failed.
            $this->deleteStoredFiles($disk, $storedPaths);

            throw $e;
        }

        return redirect()->route('tickets.confirmation', $ticket->ticket_uid);
    }

    public function confirmation(string $ticketUid): Response
    {
        $ticket = Ticket::where('ticket_uid', $ticketUid)->firstOrFail();

        return Inertia::render('tickets/Confirmation', [
            'ticket' => [
                'ticket_uid' => $ticket->ticket_uid,
                'name' => $ticket->name,
                'status' => $ticket->status,
                'price' => $ticket->price,
                'message' => $ticket->message,
                'created_at' => $ticket->created_at,
            ],
        ]);
    }

    /**
     * Customer cancels their own ticket. Only allowed while the ticket is
     * still pending or reserved — once an admin has taken it or marked it
     * successful, it can no longer be self-cancelled.
     *
     * The status check and the update happen as one conditional UPDATE (not a
     * read-then-write) so that a cancel racing an admin's status change can't
     * silently overwrite it.
     */
    public function cancel(string $ticketUid): RedirectResponse
    {
        $ticket = Ticket::where('ticket_uid', $ticketUid)->firstOrFail();

        $updated = Ticket::whereKey($ticket->getKey())
            ->whereIn('status', [TicketStatus::Pending->value, TicketStatus::Reserve->value])
            ->update(['status' => TicketStatus::Cancelled->value]);

        if ($updated === 0) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This ticket can no longer be cancelled.')]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ticket cancelled.')]);

        return back();
    }

    /**
     * JSON: a ticket's chat thread + its current status (so the confirmation
     * page's status badge stays live). Polled by the frontend, so it is kept
     * as cheap as possible: pass ?after=<last seen message id> to get only
     * newer messages (usually none => one tiny indexed query, empty response).
     * No auth — the ticket_uid itself is the access key, same as the
     * confirmation page.
     */
    public function messages(Request $request, string $ticketUid): JsonResponse
    {
        $ticket = Ticket::where('ticket_uid', $ticketUid)->select('id', 'status')->first();

        abort_if($ticket === null, 404);

        $messages = TicketMessage::feedFor($ticket->id, max(0, $request->integer('after')));

        return response()->json(
            [
                'status' => $ticket->status,
                'messages' => $messages,
                'has_more' => $messages->count() >= TicketMessage::FEED_LIMIT,
            ],
            200,
            ['Cache-Control' => 'no-store'],
        );
    }

    /**
     * JSON: customer sends a chat message on their own ticket.
     */
    public function sendMessage(Request $request, string $ticketUid): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $ticketId = Ticket::where('ticket_uid', $ticketUid)->value('id');

        abort_if($ticketId === null, 404);

        $message = TicketMessage::create([
            'ticket_id' => $ticketId,
            'sender_type' => 'customer',
            'message' => $data['message'],
        ]);

        return response()->json(['message' => $message]);
    }

    /**
     * @param  list<string>  $paths
     */
    private function deleteStoredFiles(string $disk, array $paths): void
    {
        foreach ($paths as $path) {
            rescue(fn () => Storage::disk($disk)->delete($path), report: false);
        }
    }
}
