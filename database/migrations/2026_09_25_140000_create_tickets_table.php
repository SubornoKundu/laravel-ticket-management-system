<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_uid', 30)->unique();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 30);
            $table->decimal('price', 12, 2)->default(0);
            $table->text('message')->nullable();
            // pending | reserve | successful | taken
            $table->string('status', 20)->default('pending');
            $table->foreignId('assigned_admin_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
