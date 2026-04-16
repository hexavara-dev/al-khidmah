<?php

use App\Http\Controllers\PPOBController;
use App\Http\Controllers\HomepageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomepageController::class, 'index'])->name('home');

Route::prefix('ppob')->group(function () {
    Route::get('/saldo', [PPOBController::class, 'checkBalance']);
    Route::get('/pricelist/{type}', [PPOBController::class, 'priceList']);
    Route::get('/pricelist-pasca/{type}', [PPOBController::class, 'priceListPasca']);
    Route::post('/topup', [PPOBController::class, 'topUp']);
    Route::post('/callback', [PPOBController::class, 'callback']);
});








// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
