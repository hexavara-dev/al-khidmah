<?php

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\JemaahController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PPOBController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('/', [HomepageController::class, 'index'])->name('home');
    Route::get('/history', [HistoryController::class, 'index'])->name('history');

    Route::prefix('ppob')->group(function () {
        Route::get('/saldo', [PPOBController::class, 'checkBalance']);
        Route::get('/inquiry-pln/{hp}', [PPOBController::class, 'inquiryPln']);
        Route::get('/pricelist/{type}', [PPOBController::class, 'priceList']);
        Route::get('/pricelist-pasca/{type}', [PPOBController::class, 'priceListPasca']);
        Route::post('/inquiry-ovo', [PPOBController::class, 'inquiryOvo'])->name('ppob.inquiry-ovo');
        Route::post('/checkout', [PPOBController::class, 'checkout'])->name('ppob.checkout');
        Route::post('/checkout-pasca', [PPOBController::class, 'checkoutPasca'])->name('ppob.checkout.pasca');
        Route::post('/inquiry', [PPOBController::class, 'inquiry'])->name('ppob.inquiry');
        Route::post('/callback', [PPOBController::class, 'callback'])->name('ppob.callback');
    });
});

// Midtrans payment notification webhook — must be exempt from CSRF
Route::post('/payment/notification', [PaymentController::class, 'notification'])
    ->name('payment.notification');

// Halaman finish setelah redirect kembali dari Midtrans
Route::get('/payment/finish', [PaymentController::class, 'finish'])
    ->name('payment.finish');


// Admin routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
});

// Redirect /dashboard to admin dashboard
Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

Route::get('/auth/jemaah', [JemaahController::class, 'redirect'])->name('auth.jemaah');
Route::get('/auth/jemaah/callback', [JemaahController::class, 'callback'])->name('auth.jemaah.callback');

require __DIR__.'/auth.php';
