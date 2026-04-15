<?php

namespace App\Http\Controllers;

use App\Http\Requests\PPOB\PriceListRequest;
use App\Services\IAKService;

class PPOBController extends Controller
{
    private IAKService $iakService;

    public function __construct(IAKService $iakService) {
        $this->iakService = $iakService;
    }

    public function checkBalance() {
        $result = $this->iakService->checkBalance();
        return response()->json($result);
    }

    public function priceList(PriceListRequest $request) {
        $type = (string) $request->validated('type');
        $result = $this->iakService->priceList($type);

        return response()->json($result);
    }

    // public function topUp() {
    //     //
    // }
}
