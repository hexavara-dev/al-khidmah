<?php

namespace App\Http\Controllers;

use App\Services\IAKService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HomepageController extends Controller
{
    private IAKService $iakService;

    public function __construct(IAKService $iakService) {
        $this->iakService = $iakService;
    }

    public function index() {
        $balance = null;

        try {
            $saldo   = $this->iakService->checkBalance();
            $balance = $saldo['data']['balance'] ?? null;
        } catch (ConnectionException $e) {
            Log::warning('IAK API tidak dapat dijangkau: ' . $e->getMessage());
        }

        return Inertia::render('Homepage', [
            'balance' => $balance,
        ]);
    }

    private function checkPriceList($type) {
        $pricelist = $this->iakService->priceList($type);
        return $pricelist;
    }
}
