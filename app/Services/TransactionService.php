<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TransactionService
{
    private const IAK_POSTPAID_TYPE_MAP = [
        'pln_pasca'      => 'pln',
        'tv_pasca'       => 'tv',
        'internet_pasca' => 'internet',
    ];

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
            $iakType = self::IAK_POSTPAID_TYPE_MAP[$transaction->type] ?? null;

            if ($iakType !== null) {
                try {
                    $paymentResult = $this->iakService->billPaymentPostpaid(
                        $transaction->ref_id,
                        (string) $transaction->tr_id,
                        $iakType,
                    );
                    Log::info('IAK billPayment postpaid response', ['result' => $paymentResult, 'type' => $iakType]);
                } catch (\Throwable $e) {
                    Log::error('IAK billPayment postpaid failed', [
                        'ref_id' => $transaction->ref_id,
                        'type'   => $iakType,
                        'error'  => $e->getMessage(),
                    ]);
                }
            } else {
                Log::info('Midtrans payment confirmed, calling IAK topUp', [
                    'ref_id'       => $transaction->ref_id,
                    'customer_id'  => $transaction->customer_id,
                    'product_code' => $transaction->product_code,
                ]);

                try {
                    $topUpResult = $this->iakService->topUp(
                        $transaction->ref_id,
                        $transaction->customer_id,
                        $transaction->product_code,
                    );
                    Log::info('IAK topUp response', ['result' => $topUpResult]);

                    $plnData = $topUpResult['data'] ?? [];
                    $transaction->update(array_filter([
                        'customer_name' => $plnData['name']          ?? null,
                        'segment_power' => $plnData['segment_power'] ?? null,
                    ], fn($v) => $v !== null));
                } catch (\Throwable $e) {
                    Log::error('IAK topUp failed', [
                        'ref_id' => $transaction->ref_id,
                        'error'  => $e->getMessage(),
                    ]);
                }
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
            'status'        => (int) ($data['status']  ?? $transaction->status),
            'message'       => $data['message'] ?? $transaction->message,
            'sn'            => $data['sn']      ?? $transaction->sn,
            'rc'            => $data['rc']      ?? $transaction->rc,
            'tr_id'         => $data['tr_id']   ?? $transaction->tr_id,
            'customer_name' => $data['name']          ?? $transaction->customer_name,
            'segment_power' => $data['segment_power'] ?? $transaction->segment_power,
        ]);

        return true;
    }

    public function createPostpaidInquiry(string $customerId, string $productCode, string $type): array
    {
        $iakType = self::IAK_POSTPAID_TYPE_MAP[$type] ?? null;
        if ($iakType === null) {
            throw new \RuntimeException('Tipe layanan tidak didukung.');
        }

        $refId  = (string) Str::ulid();
        $result = $this->iakService->inquiryPostpaid($refId, $productCode, $customerId, $iakType);

        Log::info('IAK inquiryPostpaid response', ['result' => $result, 'type' => $type]);

        $payload = $result['data'] ?? $result;

        $rc = $payload['response_code'] ?? null;
        if ($rc !== '00') {
            $msg = $payload['message'] ?? null;
            throw new \RuntimeException($msg ?: "Inquiry gagal (rc={$rc}). Periksa nomor pelanggan dan coba lagi.");
        }

        Transaction::create([
            'ref_id'         => $refId,
            'product_code'   => $productCode,
            'customer_id'    => $customerId,
            'customer_name'  => $payload['tr_name'] ?? null,
            'type'           => $type,
            'price'          => (int) ($payload['price'] ?? 0),
            'tr_id'          => (string) ($payload['tr_id'] ?? ''),
            'payment_status' => 'pending',
            'status'         => 0,
        ]);

        return [
            'ref_id'        => $refId,
            'customer_name' => $payload['tr_name'] ?? null,
            'period'        => $payload['period']  ?? null,
            'nominal'       => (float) ($payload['nominal'] ?? 0),
            'admin'         => (float) ($payload['admin']   ?? 0),
            'price'         => (float) ($payload['price']   ?? 0),
        ];
    }

    public function createPostpaidCheckout(string $refId): array
    {
        $transaction = Transaction::where('ref_id', $refId)
            ->whereIn('type', array_keys(self::IAK_POSTPAID_TYPE_MAP))
            ->where('payment_status', 'pending')
            ->firstOrFail();

        $finishUrl = url('/payment/finish');

        $snapToken = $this->midtransService->createSnapToken(
            ['order_id' => $refId, 'gross_amount' => $transaction->price],
            ['first_name' => $transaction->customer_id],
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
}
