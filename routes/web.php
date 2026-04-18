<?php

use App\Http\Controllers\HomepageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PPOBController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomepageController::class, 'index'])->name('home');

Route::prefix('ppob')->group(function () {
    Route::get('/saldo', [PPOBController::class, 'checkBalance']);
    Route::get('/pricelist/{type}', [PPOBController::class, 'priceList']);
    Route::get('/pricelist-pasca/{type}', [PPOBController::class, 'priceListPasca']);
    Route::post('/inquiry-ovo', [PPOBController::class, 'inquiryOvo'])->name('ppob.inquiry-ovo');
    Route::post('/checkout', [PPOBController::class, 'checkout'])->name('ppob.checkout');
    Route::post('/callback', [PPOBController::class, 'callback'])->name('ppob.callback');
});

// Midtrans payment notification webhook — must be exempt from CSRF
Route::post('/payment/notification', [PaymentController::class, 'notification'])
    ->name('payment.notification');

// Halaman finish setelah redirect kembali dari Midtrans
Route::get('/payment/finish', [PaymentController::class, 'finish'])
    ->name('payment.finish');


// Donasi SPA — semua route dari AppRouter.jsx dilayani oleh donasi.blade.php
// Public routes
Route::get('/donasi', fn() => view('donasi'));
Route::get('/campaigns/{id}', fn() => view('donasi'));

// Guest routes
Route::get('/login', fn() => view('donasi'));
Route::get('/register', fn() => view('donasi'));

// Authenticated user routes
Route::get('/my-donations', fn() => view('donasi'));
Route::get('/campaigns', fn() => view('donasi'));

// Admin routes
Route::get('/dashboard', fn() => view('donasi'));
Route::get('/dashboard/campaigns', fn() => view('donasi'));
Route::get('/dashboard/categories', fn() => view('donasi'));
Route::get('/dashboard/donations', fn() => view('donasi'));
Route::get('/dashboard/users', fn() => view('donasi'));

// Catch-all untuk sub-route SPA lainnya
Route::get('/donasi/{any}', fn() => view('donasi'))->where('any', '.*');
Route::get('/{any}', fn() => view('donasi'))->where('any', '^(?!api).*');

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });
