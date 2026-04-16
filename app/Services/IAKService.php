<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class IAKService {
    private string $userHp;
    private string $apiKey;
    private string $prepaidUrl;
    private string $postpaidUrl;

    public function __construct() {
        $this->userHp      = config('services.iak.user_hp');
        $this->apiKey      = config('services.iak.api_key');
        $this->prepaidUrl  = 'https://prepaid.iak.dev/api';
        $this->postpaidUrl = 'https://postpaid.iak.dev/api/v1/bill/check';
    }

    private function sign(string $suffix): string {
        return md5($this->userHp . $this->apiKey . $suffix);
    }

    public function checkBalance(): array {
        return Http::post($this->prepaidUrl . '/check-balance', [
            'username' => $this->userHp,
            'sign'     => $this->sign('bl'),
        ])->json();
    }

    public function priceList(string $type): array {
        return Http::post($this->prepaidUrl . '/pricelist/' . $type, [
            'username' => $this->userHp,
            'sign'     => $this->sign('pl'),
            'status'   => 'active',
        ])->json();
    }

    public function priceListPasca(string $type): array {
        return Http::post($this->postpaidUrl . '/' . $type, [
            'commands' => 'pricelist-pasca',
            'username' => $this->userHp,
            'sign'     => $this->sign('pl'),
            'status'   => 'active',
        ])->json();
    }

    public function topUp(string $refId, string $customerId, string $productCode): array {
        $payload = [
            'username'     => $this->userHp,
            'ref_id'       => $refId,
            'customer_id'  => $customerId,
            'product_code' => $productCode,
            'sign'         => $this->sign($refId),
        ];

        $response = Http::post($this->prepaidUrl . '/top-up', $payload)->json();

        return $response;
    }
}
