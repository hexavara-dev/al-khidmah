<?php

use App\Http\Controllers\API\CampaignController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\DonationController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\MobileAuthController;
use App\Http\Controllers\Auth\JemaahController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DonasiController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\PpobPageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PPOBController;
use App\Http\Controllers\PPOBServiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Authenticated app routes (PPOB, History, etc.) ──────────────
Route::middleware(['auth'])->group(function () {
    Route::get('/', [HomepageController::class, 'index'])->name('home');
    Route::get('/history', [HistoryController::class, 'index'])->name('history');
    Route::get('/ppob/{type}', [PpobPageController::class, 'show'])->name('ppob.service');

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

// ─── Payment webhook & finish (no auth / CSRF exempt) ────────────
Route::post('/payment/notification', [PaymentController::class, 'notification'])
    ->name('payment.notification');
Route::get('/payment/finish', [PaymentController::class, 'finish'])
    ->name('payment.finish');

// ─── Donasi pages (Inertia via DonasiController) ────────────────
Route::get('/donasi', [DonasiController::class, 'index'])->name('donasi.index');
Route::get('/campaigns/{campaign}', [DonasiController::class, 'show'])->name('donasi.campaign');
Route::get('/my-donations', [DonasiController::class, 'myDonations'])
    ->middleware('auth')
    ->name('donasi.my');

// ─── JSON API endpoints (only mutations + admin) ────────────────
Route::prefix('api')->group(function () {
    // Authenticated user — payment & donation mutations
    Route::middleware('auth')->group(function () {
        Route::post('/donations', [DonationController::class, 'store']);
        Route::post('/donations/{id}/confirm-payment', [DonationController::class, 'confirmPayment']);
        Route::post('/donations/{id}/check-payment', [DonationController::class, 'checkPayment']);

        // Admin only
        Route::middleware('role:admin')->group(function () {
            Route::get('/reports/campaigns', [ReportController::class, 'campaignPdf']);
            Route::get('/reports/donations', [ReportController::class, 'donationPdf']);

            Route::get('/campaigns', [CampaignController::class, 'index']);
            Route::post('/campaigns', [CampaignController::class, 'store']);
            Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
            Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);

            Route::get('/categories', [CategoryController::class, 'index']);
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            Route::get('/donations', [DonationController::class, 'index']);
            Route::put('/donations/{donation}/status', [DonationController::class, 'updateStatus']);

            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });
    });
});

// ─── Admin dashboard ─────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('/donations')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Admin/Donations');
    })->name('donations');

    Route::get('/overview', function () {
        return Inertia::render('dashboard/DashboardOverviewDonationPage');
    })->name('donations.overview');

    Route::get('/campaigns', function () {
        return Inertia::render('dashboard/DashboardCampaignsDonasiPage');
    })->name('donations.campaigns');

    Route::get('/categories', function () {
        return Inertia::render('dashboard/DashboardDonationCategoriesPage');
    })->name('donations.categories');
    });

    // -- PPOB product sync (prepaid only) -------------------------
    Route::prefix('ppob')->name('ppob.')->group(function () {
        Route::get('/{code}',       [PPOBServiceController::class, 'show'])->name('page');
        Route::get('/{code}/sync',  [PPOBController::class, 'sync'])->name('sync');
        Route::post('/{code}/save', [PPOBController::class, 'store'])->name('save');
    });
});

Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ─── OAuth ───────────────────────────────────────────────────────
Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');
Route::get('/auth/jemaah', [JemaahController::class, 'redirect'])->name('auth.jemaah');
Route::get('/auth/jemaah/callback', [JemaahController::class, 'callback'])->name('auth.jemaah.callback');
Route::post('/auth/jemaah/login', [JemaahController::class, 'loginWithPassword'])->name('auth.jemaah.login');

Route::get('/mobile-auth/consume', [MobileAuthController::class, 'consume'])
    ->name('mobile.auth.consume');

// ─── Debug OAuth (HANYA di non-production) ───────────────────────
if (app()->environment(['local', 'staging'])) {
    Route::get('/debug/google-oauth', function (Request $request) {
        $logFile = storage_path('logs/laravel.log');
        if (!file_exists($logFile)) {
            return response()->json(['error' => 'Log file tidak ditemukan']);
        }

        // Ambil 100 baris terakhir dan filter hanya baris [GoogleOAuth]
        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $filtered = array_filter($lines, fn($l) => str_contains($l, '[GoogleOAuth]') || str_contains($l, 'GoogleOAuth'));
        $recent = array_slice(array_values($filtered), -50);

        return response()->json([
            'total_google_log_lines' => count($filtered),
            'showing_last'           => count($recent),
            'logs'                   => $recent,
            'config_deep_link'       => config('services.mobile.deep_link_callback', '(tidak di-set, pakai default ekhidmah://callback)'),
            'app_url'                => config('app.url'),
            'google_redirect_uri'    => config('services.google.redirect'),
        ]);
    })->name('debug.google.oauth');

    Route::get('/debug/mobile-auth-test', function (Request $request) {
        $token = $request->query('token', 'TOKEN_KOSONG');
        $deepLink = config('services.mobile.deep_link_callback', 'ekhidmah://callback')
            . '?token=' . rawurlencode($token)
            . '&return_url=' . rawurlencode(url('/donasi?mobile=1'));

        return response()->json([
            'deep_link'        => $deepLink,
            'consume_url'      => route('mobile.auth.consume', ['token' => $token, 'return_url' => '/donasi?mobile=1']),
            'config_deep_link' => config('services.mobile.deep_link_callback', '(tidak di-set)'),
        ]);
    })->name('debug.mobile.auth.test');
}

require __DIR__ . '/auth.php';
