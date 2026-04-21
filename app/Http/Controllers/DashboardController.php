<?php

namespace App\Http\Controllers;

use App\Services\IAKService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(): \Inertia\Response
    {
        $iakBalance = 0;
        try {
            $res        = app(IAKService::class)->checkBalance();
            $iakBalance = (int) ($res['data']['balance'] ?? 0);
        } catch (\Throwable) {
            // keep 0
        }

        $isSandbox = ! (bool) config('services.midtrans.is_production', false);

        return Inertia::render('Admin/Dashboard', [
            'iakBalance'      => $iakBalance,
            'midtransBalance' => 0,
            'midtransSandbox' => $isSandbox,
        ]);
    }
}
