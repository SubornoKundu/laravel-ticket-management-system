<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketMessage extends Model
{
    /** Max messages returned per request, so one busy chat can never produce a huge response. */
    public const FEED_LIMIT = 200;

    protected $fillable = ['ticket_id', 'sender_type', 'admin_id', 'message'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Messages of one ticket, oldest first, for the chat polling endpoints.
     *
     * - $afterId > 0: only messages newer than that id (cheap "anything new?" poll).
     * - $afterId = 0: the most recent FEED_LIMIT messages (initial load).
     *
     * @return Collection<int, static>
     */
    public static function feedFor(int $ticketId, int $afterId = 0): Collection
    {
        $query = static::query()
            ->where('ticket_id', $ticketId)
            ->with('admin:id,name');

        if ($afterId > 0) {
            return $query->where('id', '>', $afterId)
                ->orderBy('id')
                ->limit(self::FEED_LIMIT)
                ->get();
        }

        return $query->orderByDesc('id')
            ->limit(self::FEED_LIMIT)
            ->get()
            ->reverse()
            ->values();
    }
}
