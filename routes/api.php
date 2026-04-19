<?php

use App\Http\Controllers\API\CampaignController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\DonationController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Midtrans webhook (must be public, Midtrans calls this)
Route::post('/midtrans/webhook', [DonationController::class, 'midtransWebhook']);

Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
Route::get('/campaigns/{campaign}/donors', [DonationController::class, 'forCampaign']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // User donations
    Route::post('/donations', [DonationController::class, 'store']);
    Route::post('/donations/{id}/confirm-payment', [DonationController::class, 'confirmPayment']);
    Route::post('/donations/{id}/check-payment', [DonationController::class, 'checkPayment']);
    Route::get('/my-donations', [DonationController::class, 'myDonations']);

    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        // Reports (PDF download)
        Route::get('/reports/campaigns', [ReportController::class, 'campaignPdf']);
        Route::get('/reports/donations', [ReportController::class, 'donationPdf']);

        // Campaigns
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);

        // Categories
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Donations
        Route::get('/donations', [DonationController::class, 'index']);
        Route::put('/donations/{donation}/status', [DonationController::class, 'updateStatus']);

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});
