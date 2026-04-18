<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IAKService {
    private string $userHp;
    private string $apiKey;
    private string $prepaidUrl;
    private string $postpaidUrl;
    private string $postpaidPaymentUrl;

    public function __construct() {
        $this->userHp             = config('services.iak.user_hp');
        $this->apiKey             = config('services.iak.api_key');
        $this->prepaidUrl         = config('services.iak.prepaid_url');
        $this->postpaidUrl        = config('services.iak.postpaid_url');
        $this->postpaidPaymentUrl = config('services.iak.postpaid_payment_url');
    }

    private function sign(string $suffix): string {
        return md5($this->userHp . $this->apiKey . $suffix);
    }

    public function checkBalance(): array {
        return Http::post($this->prepaidUrl . '/check-balance', [
            'commands' => 'checkBalance',
            'username' => $this->userHp,
            'sign'     => $this->sign('bl'),
        ])->json();
    }

    public function priceList(string $type): array {
        return Http::post($this->prepaidUrl . '/pricelist', [
            'commands' => 'pricelist',
            'username' => $this->userHp,
            'sign'     => $this->sign('pl'),
            'status'   => 'active',
            'type'     => $type,
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

    public function inquiryPostpaid(string $refId, string $code, string $hp, string $iakType): array {
        return Http::post($this->postpaidUrl . '/' . $iakType, [
            'commands' => 'inq-pasca',
            'username' => $this->userHp,
            'code'     => $code,
            'hp'       => $hp,
            'ref_id'   => $refId,
            'sign'     => $this->sign($refId),
        ])->json();
    }

    public function billPaymentPostpaid(string $refId, string $trId, string $iakType): array {
        return Http::post($this->postpaidPaymentUrl . '/' . $iakType, [
            'commands' => 'pay-pasca',
            'username' => $this->userHp,
            'tr_id'    => $trId,
            'ref_id'   => $refId,
            'sign'     => md5($this->userHp . $this->apiKey . $trId),
        ])->json();
    }

    public function inquiryPln(string $hp): array {
        $response = Http::post($this->prepaidUrl . '/inquiry-pln', [
            'commands' => 'inquiry_pln',
            'username' => $this->userHp,
            'hp'       => $hp,
            'sign'     => md5($this->userHp . $this->apiKey . $hp),
        ])->json();
        return $response ?? [];
    }

    public function topUp(string $refId, string $customerId, string $productCode): array {
        return Http::post($this->prepaidUrl . '/top-up', [
            'username'     => $this->userHp,
            'ref_id'       => $refId,
            'customer_id'  => $customerId,
            'product_code' => $productCode,
            'sign'         => $this->sign($refId),
        ])->json();
    }
}
