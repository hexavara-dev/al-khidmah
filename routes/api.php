<?php

use App\Http\Controllers\API\DonationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Only stateless endpoints that must bypass CSRF and session middleware
| belong here. All other JSON endpoints live in web.php under /api prefix.
|
*/

// Midtrans webhook — called by Midtrans servers (external, no CSRF/session)
Route::post('/midtrans/webhook', [DonationController::class, 'midtransWebhook']);
