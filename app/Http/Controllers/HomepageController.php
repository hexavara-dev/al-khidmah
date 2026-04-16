<?php

namespace App\Http\Controllers;

use App\Services\IAKService;
use Inertia\Inertia;

class HomepageController extends Controller
{
    private IAKService $iakService;

    public function __construct(IAKService $iakService) {
        $this->iakService = $iakService;
    }

    public function index() {
        $saldo = $this->iakService->checkBalance();

        return Inertia::render('Homepage', [
            'balance' => $saldo['data']['balance'] ?? 0,
        ]);
    }

    private function checkPriceList($type) {
        $pricelist = $this->iakService->priceList($type);
        return $pricelist;
    }
}
