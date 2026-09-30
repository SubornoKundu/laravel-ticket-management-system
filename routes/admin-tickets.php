<?php

use App\Http\Controllers\Admin\TicketController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::get('/', [TicketController::class, 'index'])->name('index');
        Route::patch('/{ticket}/status', [TicketController::class, 'updateStatus'])->name('status');

        Route::prefix('{ticket}/messages')->name('messages.')->group(function () {
            Route::get('/', [TicketController::class, 'messages'])->name('index');
            Route::post('/', [TicketController::class, 'sendMessage'])->name('store');
        });
    });
});
