<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TransactionService
{
    private $iakService;
    private $midtransService;

    public function __construct(
        IAKService $iakService,
        MidtransService $midtransService,
    ) {
        $this->iakService = $iakService;
        $this->midtransService = $midtransService;
    }

    public function createCheckout(
        string $customerId,
        string $productCode,
        string $type,
        int $price,
    ): array {
        $refId = (string) Str::ulid();

        $transaction = Transaction::create([
            'ref_id'         => $refId,
            'product_code'   => $productCode,
            'customer_id'    => $customerId,
            'type'           => $type,
            'price'          => $price,
            'payment_status' => 'pending',
            'status'         => 0,
        ]);

        $finishUrl = url('/payment/finish');

        $snapToken = $this->midtransService->createSnapToken(
            ['order_id' => $refId, 'gross_amount' => $price],
            ['first_name' => $customerId],
            [
                'callbacks' => [
                    'finish'   => $finishUrl,
                    'unfinish' => $finishUrl,
                    'error'    => $finishUrl,
                ],
            ],
        );

        $transaction->update(['snap_token' => $snapToken]);

        return [
            'snap_token'   => $snapToken,
            'redirect_url' => $this->midtransService->getSnapRedirectUrl($snapToken),
        ];
    }

    public function handleMidtransNotification(
        string $orderId,
        string $statusCode,
        string $grossAmount,
        string $signatureKey,
        string $transactionStatus,
        string $fraudStatus,
    ): bool {
        if (!$this->midtransService->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            return false;
        }

        $transaction = Transaction::where('ref_id', $orderId)->first();

        if (!$transaction) {
            return true;
        }

        $transaction->update(['payment_status' => $transactionStatus]);

        $isPaid = $transactionStatus === 'settlement'
            || ($transactionStatus === 'capture' && $fraudStatus === 'accept');

        if ($isPaid) {
            Log::info('Midtrans payment confirmed, calling IAK topUp', [
                'ref_id' => $transaction->ref_id,
                'customer_id' => $transaction->customer_id,
                'product_code' => $transaction->product_code,
            ]);

            try {
                $topUpResult = $this->iakService->topUp(
                    $transaction->ref_id,
                    $transaction->customer_id,
                    $transaction->product_code,
                );
                Log::info('IAK topUp response', ['result' => $topUpResult]);
            } catch (\Throwable $e) {
                Log::error('IAK topUp failed', [
                    'ref_id' => $transaction->ref_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return true;
    }

    public function handleIakCallback(array $data): bool
    {
        $refId = $data['ref_id'] ?? null;
        $sign  = $data['sign']   ?? null;

        if (!$refId || !$sign) {
            return false;
        }

        $expected = md5(
            config('services.iak.user_hp') .
            config('services.iak.api_key') .
            $refId
        );

        if (!hash_equals($expected, $sign)) {
            return false;
        }

        $transaction = Transaction::where('ref_id', $refId)->first();

        if (!$transaction) {
            return true;
        }

        $transaction->update([
            'status'  => (int) ($data['status']  ?? $transaction->status),
            'message' => $data['message'] ?? $transaction->message,
            'sn'      => $data['sn']      ?? $transaction->sn,
            'rc'      => $data['rc']      ?? $transaction->rc,
            'tr_id'   => $data['tr_id']   ?? $transaction->tr_id,
        ]);

        return true;
    }
}
