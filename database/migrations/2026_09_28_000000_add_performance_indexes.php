<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Admin list: filter by status, newest first.
            $table->index(['status', 'created_at'], 'tickets_status_created_at_index');
            // "My tickets" dashboard: one user's tickets, newest first.
            $table->index(['user_id', 'created_at'], 'tickets_user_id_created_at_index');
        });

        Schema::table('ticket_messages', function (Blueprint $table) {
            // Chat polling: "messages of ticket X with id greater than N".
            $table->index(['ticket_id', 'id'], 'ticket_messages_ticket_id_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_messages', function (Blueprint $table) {
            $table->dropIndex('ticket_messages_ticket_id_id_index');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('tickets_user_id_created_at_index');
            $table->dropIndex('tickets_status_created_at_index');
        });
    }
};
