<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class IAKService {
    private string $userHp;
    private string $apiKey;
    private string $baseUrl;

    public function __construct() {
        $this->userHp = config('services.iak.user_hp');
        $this->apiKey = config('services.iak.api_key');
        $this->baseUrl  = 'https://prepaid.iak.dev/api';
    }

    private function sign(string $suffix): string {
        return md5($this->userHp . $this->apiKey . $suffix);
    }

    private function post(string $endpoint, array $payload): Response {
        return Http::post($this->baseUrl . $endpoint, $payload);
    }

    public function checkBalance(): array {
        return $this->post('/check-balance', [
            'commands' => 'checkBalance',
            'username' => $this->userHp,
            'sign'     => $this->sign('bl'),
        ])->json();
    }

    public function priceList(string $type): array {
        return $this->post('/pricelist', [
            'commands' => 'pricelist',
            'username' => $this->userHp,
            'sign'     => $this->sign('pl'),
            'status'   => 'active',
            'type'     => $type,
        ])->json();
    }


    public function inquiryPln(string $customerId, string $productCode): array
    {
        return $this->post('/transaction', [
            'commands'   => 'inq-pra',
            'username'   => $this->userHp,
            'customer_id' => $customerId,
            'code'       => $productCode,
            'sign'       => $this->sign($customerId),
        ])->json();
    }

    public function topUpPln(string $customerId, string $productCode, string $refId): array
    {
        return $this->post('/transaction', [
            'commands'    => 'topup',
            'username'    => $this->userHp,
            'customer_id' => $customerId,
            'product_code' => $productCode,
            'ref_id'      => $refId,
            'sign'        => $this->sign($refId),
        ])->json();
    }
}
