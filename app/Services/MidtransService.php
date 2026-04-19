<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MidtransService {
    private string $serverKey;
    private string $clientKey;
    private bool $isProduction;
    private string $snapUrl;

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
}
