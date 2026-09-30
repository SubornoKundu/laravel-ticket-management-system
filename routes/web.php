<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

// Controllers (not closures) so `php artisan route:cache` / `optimize` work in production.
Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin-tickets.php';
require __DIR__.'/admin-users.php';
require __DIR__.'/tickets.php';
