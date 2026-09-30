<?php

use App\Http\Controllers\Admin\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('admins', [AdminController::class, 'index'])->name('admins.index');
    Route::post('admins', [AdminController::class, 'store'])->name('admins.store');
    Route::delete('admins/{admin}', [AdminController::class, 'destroy'])->name('admins.destroy');
});
