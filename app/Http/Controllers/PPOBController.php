<?php

namespace App\Http\Controllers;

use App\Http\Requests\PPOB\PriceListRequest;
use App\Http\Requests\PPOB\InquiryPlnRequest;
use App\Services\IAKService;

class PPOBController extends Controller
{
    private IAKService $iakService;

    public function __construct(IAKService $iakService)
    {
        $this->iakService = $iakService;
    }


    public function checkBalance()
    {
        $result = $this->iakService->checkBalance();

        return response()->json($result);
    }


    public function priceList(PriceListRequest $request)
    {
        $type = (string) $request->validated('type');

        $result = $this->iakService->priceList($type);

        return response()->json($result);
    }

    /**
     * Inquiry PLN (cek ID pelanggan sebelum transaksi)
     */
    public function inquiryPln(InquiryPlnRequest $request)
    {
        $customerId  = (string) $request->validated('customer_id');
        $productCode = (string) $request->validated('product_code');

        $result = $this->iakService->inquiryPln($customerId, $productCode);

        return response()->json($result);
    }


    // public function topUpPln(Request $request)
    // {
    //     //
    // }
}
