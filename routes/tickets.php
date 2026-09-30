<?php

/**
 * Public routes — no auth middleware, since users submit tickets
 * without logging in.
 *
 * Rate limiters (ticket-create, ticket-poll, ticket-chat) are defined in
 * AppServiceProvider.
 */

use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;

Route::prefix('tickets')->name('tickets.')->group(function () {
    Route::get('/create', [TicketController::class, 'create'])->name('create');
    Route::post('/', [TicketController::class, 'store'])->name('store')->middleware('throttle:ticket-create');

    // Malformed IDs are rejected by the router itself, before touching the database.
    Route::where(['ticketUid' => '[A-Za-z0-9-]{8,40}'])->group(function () {
        Route::get('/confirmation/{ticketUid}', [TicketController::class, 'confirmation'])->name('confirmation');
        Route::post('/confirmation/{ticketUid}/cancel', [TicketController::class, 'cancel'])
            ->name('cancel')
            ->middleware('throttle:ticket-chat');
        Route::get('/confirmation/{ticketUid}/messages', [TicketController::class, 'messages'])
            ->name('messages')
            ->middleware('throttle:ticket-poll');
        Route::post('/confirmation/{ticketUid}/messages', [TicketController::class, 'sendMessage'])
            ->name('sendMessage')
            ->middleware('throttle:ticket-chat');
    });
});
