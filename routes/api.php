<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PPOBController;

Route::prefix('ppob')->group(function () {


    Route::get('/saldo', [PPOBController::class, 'checkBalance']);

    Route::get('/pricelist/{type?}', [PPOBController::class, 'priceList']);


    Route::post('/pln/inquiry', [PPOBController::class, 'inquiryPln']);

    /**
     * POST /api/ppob/pln/topup
     */
    // Route::post('/pln/topup', [PPOBController::class, 'topUpPln']);

});
