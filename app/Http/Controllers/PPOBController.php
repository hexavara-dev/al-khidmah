<?php

namespace App\Http\Controllers;

use App\Http\Requests\PPOB\PriceListRequest;
use App\Http\Requests\PPOB\PostpaidPriceListRequest;
use App\Http\Requests\PPOB\TopUpRequest;
use App\Models\Transaction;
use App\Services\IAKService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

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

    public function priceListPasca(PostpaidPriceListRequest $request) {
        $type = (string) $request->validated('type');
        $result = $this->iakService->priceListPasca($type);

        return response()->json($result);
    }

    // public function topUp() {
    //     //
    // }

    public function topUp(TopUpRequest $request) {
        $customerId  = (string) $request->validated('customer_id');
        $productCode = (string) $request->validated('product_code');
        $type        = (string) $request->validated('type');

        $refId = (string) Str::ulid();

        Transaction::create([
            'ref_id'       => $refId,
            'product_code' => $productCode,
            'customer_id'  => $customerId,
            'type'         => $type,
            'price'        => 0,
            'status'       => 0,
        ]);

        $result = $this->iakService->topUp($refId, $customerId, $productCode);

        return response()->json($result);
    }

    public function callback(Request $request): Response
    {
        $data  = $request->input('data', []);
        $refId = $data['ref_id'] ?? null;
        $sign  = $data['sign']   ?? null;

        if (!$refId || !$sign) {
            return response('Bad Request', 400);
        }

        $expected = md5(
            config('services.iak.user_hp') .
            config('services.iak.api_key') .
            $refId
        );

        if (!hash_equals($expected, $sign)) {
            return response('Forbidden', 403);
        }

        $transaction = Transaction::where('ref_id', $refId)->first();

        if (!$transaction) {
            return response('OK', 200);
        }

        $transaction->update([
            'status'  => (int) ($data['status']  ?? $transaction->status),
            'message' => $data['message'] ?? $transaction->message,
            'sn'      => $data['sn']      ?? $transaction->sn,
            'rc'      => $data['rc']      ?? $transaction->rc,
        ]);

        return response('OK', 200);
    }
}
