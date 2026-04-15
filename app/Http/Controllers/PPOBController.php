<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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

    public function priceList(Request $request) {
        $type   = $request->query('type', $request->input('type', 'pulsa'));
        $result = $this->iakService->priceList($type);

        return response()->json($result);
    }

    // public function topUp() {
    //     //
    // }
}
