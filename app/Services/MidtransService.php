<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MidtransService {
    private string $serverKey;
    private string $clientKey;
    private bool $isProduction;
    private string $snapUrl;
    private string $snapJsUrl;
    private string $snapBaseUrl;
    private string $apiBaseUrl;

    public function __construct() {
        $this->serverKey = (string) config('services.midtrans.server_key', '');
        $this->clientKey = (string) config('services.midtrans.client_key', '');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);

        $this->snapUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $this->snapJsUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        $this->snapBaseUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap'
            : 'https://app.sandbox.midtrans.com/snap';

        $this->apiBaseUrl = $this->isProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    public function createSnapToken(array $transactionDetails, array $customerDetails, array $options = []): string {
        $payload = array_merge([
            'transaction_details' => $transactionDetails,
            'customer_details' => $customerDetails,
        ], $options);

        $response = Http::withBasicAuth($this->serverKey, '')
            ->post($this->snapUrl, $payload);

        if ($response->failed()) {
            throw new \Exception('Failed to create Midtrans Snap token: ' . $response->body());
        }

        return $response->json('token');
    }

    /**
     * Get transaction status from Midtrans API v2.
     */
    public function getTransactionStatus(string $orderId): object
    {
        $response = Http::withBasicAuth($this->serverKey, '')
            ->get("{$this->apiBaseUrl}/v2/{$orderId}/status");

        if ($response->failed()) {
            throw new \Exception('Failed to get Midtrans transaction status: ' . $response->body());
        }

        return $response->object();
    }

    /**
     * Parse and verify a Midtrans webhook notification payload.
     */
    public function parseWebhookNotification(array $payload): object
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signatureKey = $payload['signature_key'] ?? '';

        if (!$this->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            throw new \Exception('Invalid Midtrans webhook signature.');
        }

        return (object) $payload;
    }

    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey) {
        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);
        return hash_equals($expected, $signatureKey);
    }

    public function getSnapClientKey(): string {
        return $this->clientKey;
    }

    public function getSnapJsUrl(): string {
        return $this->snapJsUrl;
    }

    public function getSnapRedirectUrl(string $token): string {
        return $this->snapBaseUrl . '/v2/vtweb/' . $token;
    }

    /**
     * Fetch the merchant's current effective balance via the Balance Mutation API.
     * Docs: https://docs.midtrans.com/reference/merchant-balance-mutation-api
     * Uses closing_balance_effective at end of queried window as the "current balance".
     */
    public function getMerchantBalance(): float
    {
        $tz    = 'Asia/Jakarta';
        $now   = now()->timezone($tz);
        $start = $now->copy()->startOfDay()->format('Y-m-d\TH:i:sP');
        $end   = $now->format('Y-m-d\TH:i:sP');

        $response = Http::withBasicAuth($this->serverKey, '')
            ->get("{$this->apiBaseUrl}/v1/balance/mutation", [
                'currency'   => 'IDR',
                'start_time' => $start,
                'end_time'   => $end,
            ]);

        if ($response->failed()) {
            return 0;
        }

        return (float) ($response->json('closing_balance_effective') ?? 0);
    }
}
