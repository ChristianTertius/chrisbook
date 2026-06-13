<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\Admin\BookController as AdminBookController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MidtransWebHookController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Publik
Route::get('/', [BookController::class, 'index']);
Route::get('/books/{slug}', [BookController::class, 'show']);

// Customer (auth)
Route::middleware('auth')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
});

// Webhook Midtrans (tanpa CSRF, tanpa auth)
Route::post('/midtrans/notification', [MidtransWebHookController::class, 'handle']);

// Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::resource('books', AdminBookController::class);
    // Route::resource('orders', Admin\OrderController::class)->only(['index', 'show', 'update']);
    // Route::resource('categories', Admin\CategoryController::class);
});
require __DIR__ . '/settings.php';
