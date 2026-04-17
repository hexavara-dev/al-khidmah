<?php

namespace App\Http\Controllers;

use App\Http\Requests\PPOB\PriceListRequest;
use App\Http\Requests\PPOB\PostpaidPriceListRequest;
use App\Http\Requests\PPOB\TopUpRequest;
use App\Services\IAKService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PPOBController extends Controller
{
    public function __construct(
        private IAKService $iakService,
        private TransactionService $transactionService,
    ) {}

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

    public function checkout(TopUpRequest $request) {
        $data = $this->transactionService->createCheckout(
            customerId:  (string) $request->validated('customer_id'),
            productCode: (string) $request->validated('product_code'),
            type:        (string) $request->validated('type'),
            price:       (int)    $request->validated('price'),
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

