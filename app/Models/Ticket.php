<?php

namespace App\Models;

use App\Enums\TicketStatus;
use Closure;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class Ticket extends Model
{
    use HasFactory;

    /**
     * Unambiguous characters only (no 0/O, 1/I/L) so the ID is easy to read out
     * or copy by hand. 31 symbols x 10 positions = ~8 x 10^14 combinations, which
     * also makes the ID impractical to guess (it doubles as the customer's
     * access key for the public status/chat page).
     */
    private const UID_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

    private const UID_RANDOM_LENGTH = 10;

    /** Test hook — see generateUidUsing(). */
    protected static ?Closure $uidGenerator = null;

    protected $fillable = [
        'ticket_uid',
        'user_id',
        'name',
        'email',
        'phone',
        'price',
        'message',
        'status',
        'assigned_admin_id',
    ];

    protected $casts = [
        'status' => TicketStatus::class,
        'price' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            if (empty($ticket->ticket_uid)) {
                $ticket->ticket_uid = static::generateUid();
            }
        });
    }

    /**
     * Override the ID generator (tests only). Pass null to restore the default.
     */
    public static function generateUidUsing(?Closure $generator): void
    {
        static::$uidGenerator = $generator;
    }

    /**
     * Human-readable ticket reference, e.g. TKT-20260925-K7M2QX9RBD.
     *
     * Uniqueness is guaranteed by the UNIQUE index on `ticket_uid`, not by a
     * "SELECT ... exists" pre-check: a pre-check costs an extra query per ticket
     * and is still racy when many requests are inserting at the same instant.
     * Use createWithUniqueUid() to insert with an automatic retry on collision.
     */
    public static function generateUid(): string
    {
        if (static::$uidGenerator) {
            return (string) (static::$uidGenerator)();
        }

        $max = strlen(self::UID_ALPHABET) - 1;
        $suffix = '';

        for ($i = 0; $i < self::UID_RANDOM_LENGTH; $i++) {
            $suffix .= self::UID_ALPHABET[random_int(0, $max)];
        }

        return 'TKT-'.now()->format('Ymd').'-'.$suffix;
    }

    /**
     * @deprecated Kept so older callers keep working; uniqueness is now enforced
     *             by the database index. Prefer createWithUniqueUid().
     */
    public static function generateUniqueUid(): string
    {
        return static::generateUid();
    }

    /**
     * Insert a ticket, transparently retrying with a fresh ID if (very
     * unlikely) another request grabbed the same one at the same moment.
     * Safe to call inside an outer DB transaction (each attempt is a savepoint).
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function createWithUniqueUid(array $attributes, int $maxAttempts = 5): static
    {
        $attempt = 0;

        while (true) {
            $attempt++;

            try {
                return DB::transaction(
                    fn () => static::create([...$attributes, 'ticket_uid' => static::generateUid()])
                );
            } catch (UniqueConstraintViolationException $e) {
                // Only an ID clash is worth retrying; any other unique
                // violation is a real error and must surface.
                if ($attempt >= $maxAttempts || ! str_contains($e->getMessage(), 'ticket_uid')) {
                    throw $e;
                }
            }
        }
    }

    public function screenshots(): HasMany
    {
        return $this->hasMany(TicketScreenshot::class);
    }

    /**
     * Ordered by primary key, not created_at: timestamps only have 1-second
     * resolution, so messages sent within the same second could otherwise come
     * back in a random order (and break "give me everything after message X").
     */
    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class)->orderBy('id');
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
