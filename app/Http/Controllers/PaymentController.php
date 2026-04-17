<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        private TransactionService $transactionService,
    ) {}

    public function notification(Request $request): Response
    {
        $valid = $this->transactionService->handleMidtransNotification(
            orderId:           (string) $request->input('order_id', ''),
            statusCode:        (string) $request->input('status_code', ''),
            grossAmount:       (string) $request->input('gross_amount', ''),
            signatureKey:      (string) $request->input('signature_key', ''),
            transactionStatus: (string) $request->input('transaction_status', ''),
            fraudStatus:       (string) $request->input('fraud_status', ''),
        );

        if (!$valid) {
            return response('Forbidden', 403);
        }

        return response('OK', 200);
    }

    public function finish(Request $request): \Inertia\Response
    {
        $orderId           = (string) $request->query('order_id', '');
        $transactionStatus = (string) $request->query('transaction_status', '');
        $statusCode        = (string) $request->query('status_code', '');

        $transaction = $orderId
            ? Transaction::where('ref_id', $orderId)->first()
            : null;

        return Inertia::render('Payment/Finish', [
            'orderId'           => $orderId,
            'transactionStatus' => $transactionStatus,
            'statusCode'        => $statusCode,
            'transaction'       => $transaction ? [
                'product_code' => $transaction->product_code,
                'customer_id'  => $transaction->customer_id,
                'price'        => $transaction->price,
                'type'         => $transaction->type,
            ] : null,
        ]);
    }
}

