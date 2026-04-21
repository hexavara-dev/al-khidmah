<?php

namespace App\Http\Controllers;

use App\Services\IAKService;
use App\Services\MidtransService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private IAKService $iakService,
        private MidtransService $midtransService,
    ) {}

    public function index(): \Inertia\Response
    {
        $iakBalance = 0;
        try {
            $res        = $this->iakService->checkBalance();
            $iakBalance = (int) ($res['data']['balance'] ?? 0);
        } catch (\Throwable) {
            // keep 0
        }

        $isSandbox       = ! (bool) config('services.midtrans.is_production', false);
        $midtransBalance = 0;

        if (! $isSandbox) {
            try {
                $midtransBalance = $this->midtransService->getMerchantBalance();
            } catch (\Throwable) {
                // keep 0
            }
        }

        return Inertia::render('Admin/Dashboard', [
            'iakBalance'      => $iakBalance,
            'midtransBalance' => $midtransBalance,
            'midtransSandbox' => $isSandbox,
        ]);
    }
}
