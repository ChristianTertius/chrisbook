<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\Admin\BookController as AdminBookController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MidtransWebHookController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShippingController;
use Illuminate\Support\Facades\Route;

// Publik
Route::get('/', [BookController::class, 'index'])->name('home');
Route::get('/books/{book}', [BookController::class, 'show']);

// Customer (auth)
Route::middleware('auth')->group(function () {
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::delete('/cart/{item}', [CartController::class, 'destroy']);

    Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    Route::resource('addresses', AddressController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::post('/addresses/{address}/default', [AddressController::class, 'setDefault'])
        ->name('addresses.default');

    // Ongkir (auth)
    Route::get('/shipping/provinces', [ShippingController::class, 'provinces']);
    Route::get('/shipping/cities', [ShippingController::class, 'cities']);
    Route::post('/shipping/cost', [ShippingController::class, 'cost']);
});

// Webhook Midtrans (tanpa CSRF, tanpa auth)
Route::post('/midtrans/notification', [MidtransWebHookController::class, 'handle']);

// Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('books', AdminBookController::class);
    Route::resource('orders', AdminOrderController::class)->only(['index', 'show', 'update']);
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
});
require __DIR__.'/settings.php';
