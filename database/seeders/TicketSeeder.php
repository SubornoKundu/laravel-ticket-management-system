<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        Ticket::factory()
            ->count(24)
            ->create()
            ->each(function (Ticket $ticket) {
                // Placeholder screenshots so the UI has something to render.
                // Swap for real uploaded paths once ticket creation exists.
                $ticket->screenshots()->createMany([
                    ['path' => "https://picsum.photos/seed/{$ticket->id}-a/640/420"],
                    ['path' => "https://picsum.photos/seed/{$ticket->id}-b/640/420"],
                ]);

                $ticket->messages()->create([
                    'sender_type' => 'customer',
                    'message' => 'Hi, I wanted to check the status of my order.',
                ]);

                $ticket->messages()->create([
                    'sender_type' => 'admin',
                    'admin_id' => User::first()?->id,
                    'message' => 'Thanks for reaching out — checking this now.',
                ]);
            });
    }
}
