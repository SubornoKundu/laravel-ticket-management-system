<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TicketScreenshot extends Model
{
    protected $fillable = ['ticket_id', 'path'];

    protected $appends = ['url'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Resolves either a storage path or an already-full URL, so seeded/demo
     * screenshots and real uploads both work. The disk comes from
     * config('filesystems.ticket_disk') so uploads can live on shared storage
     * (S3 etc.) when the app runs on more than one server.
     */
    public function getUrlAttribute(): string
    {
        if (Str::startsWith($this->path, ['http://', 'https://'])) {
            return $this->path;
        }

        return Storage::disk(config('filesystems.ticket_disk', 'public'))->url($this->path);
    }
}
