<?php

namespace App\Http\Controllers;

use App\Http\Requests\PPOB\InquiryRequest;
use App\Http\Requests\PPOB\PostpaidCheckoutRequest;
use App\Http\Requests\PPOB\PostpaidPriceListRequest;
use App\Http\Requests\PPOB\PriceListRequest;
use App\Http\Requests\PPOB\TopUpRequest;
use App\Services\IAKService;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PPOBController extends Controller
{
    public function __construct(
        private IAKService $iakService,
        private TransactionService $transactionService,
    ) {}

    public function inquiryPln(string $hp): JsonResponse
    {
        $result = $this->iakService->inquiryPln($hp);
        $data   = $result['data'] ?? $result;
        $status = (int) ($data['status'] ?? 0);

        if ($status !== 1) {
            return response()->json(['message' => $data['message'] ?? 'Nomor meter tidak ditemukan.'], 422);
        }

        return response()->json([
            'name'          => $data['name']          ?? null,
            'meter_no'      => $data['meter_no']       ?? null,
            'segment_power' => $data['segment_power'] ?? null,
        ]);
    }

    public function checkBalance() {
        $result = $this->iakService->checkBalance();
        return response()->json($result);
    }

    public function priceList(PriceListRequest $request) {
        $type   = (string) $request->validated('type');
        $result = $this->iakService->priceList($type);
        return response()->json($result);
    }

    public function priceListPasca(PostpaidPriceListRequest $request) {
        $type   = (string) $request->validated('type');
        $result = $this->iakService->priceListPasca($type);
        return response()->json($result);
    }

    public function inquiryOvo(Request $request) {
        $request->validate([
            'customer_id' => 'required|string|regex:/^08\d{8,11}$/',
        ]);

        $result = $this->iakService->inquiryOvo($request->input('customer_id'));
        $data   = $result['data'] ?? [];

        if (($data['rc'] ?? '') !== '00') {
            return response()->json([
                'success' => false,
                'message' => $data['message'] ?? 'Nomor OVO tidak valid.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'name'    => $data['name'] ?? '-',
        ]);
    }

    public function checkout(TopUpRequest $request) {
        $data = $this->transactionService->createCheckout(
            customerId:  (string) $request->validated('customer_id'),
            productCode: (string) $request->validated('product_code'),
            type:        (string) $request->validated('type'),
            price:       (int)    $request->validated('price'),
        );

        return response()->json($data);
    }

    public function inquiry(InquiryRequest $request): JsonResponse
    {
        try {
            $data = $this->transactionService->createPostpaidInquiry(
                customerId:  (string) $request->validated('customer_id'),
                productCode: (string) $request->validated('product_code'),
                type:        (string) $request->validated('type'),
            );
            return response()->json($data);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function checkoutPasca(PostpaidCheckoutRequest $request): JsonResponse
    {
        $data = $this->transactionService->createPostpaidCheckout(
            refId: (string) $request->validated('ref_id'),
        );
        return response()->json($data);
    }

    public function callback(Request $request): Response
    {
        Log::info('IAK callback received', [
            'body'    => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        $data  = $request->input('data', []);
        $valid = $this->transactionService->handleIakCallback($data);

        if ($valid === false && empty($data['ref_id'])) {
            Log::warning('IAK callback rejected: missing ref_id', ['body' => $request->all()]);
            return response('Bad Request', 400);
        }

        if ($valid === false) {
            Log::warning('IAK callback rejected: invalid signature', ['data' => $data]);
            return response('Forbidden', 403);
        }

        Log::info('IAK callback processed successfully', ['ref_id' => $data['ref_id'] ?? null]);
        return response('OK', 200);
    }
}

