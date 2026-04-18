<?php

use App\Http\Controllers\HomepageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PPOBController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomepageController::class, 'index'])->name('home');

Route::prefix('ppob')->group(function () {
    Route::get('/saldo', [PPOBController::class, 'checkBalance']);
    Route::get('/inquiry-pln/{hp}', [PPOBController::class, 'inquiryPln']);
    Route::get('/pricelist/{type}', [PPOBController::class, 'priceList']);
    Route::get('/pricelist-pasca/{type}', [PPOBController::class, 'priceListPasca']);
    Route::post('/checkout', [PPOBController::class, 'checkout'])->name('ppob.checkout');
    Route::post('/checkout-pasca', [PPOBController::class, 'checkoutPasca'])->name('ppob.checkout.pasca');
    Route::post('/inquiry', [PPOBController::class, 'inquiry'])->name('ppob.inquiry');
    Route::post('/callback', [PPOBController::class, 'callback'])->name('ppob.callback');
});

// Midtrans payment notification webhook — must be exempt from CSRF
Route::post('/payment/notification', [PaymentController::class, 'notification'])
    ->name('payment.notification');

// Halaman finish setelah redirect kembali dari Midtrans
Route::get('/payment/finish', [PaymentController::class, 'finish'])
    ->name('payment.finish');








// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
