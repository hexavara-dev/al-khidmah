<?php

namespace App\Services;

class MidtransService{
    private string $serverKey;
    private string $clientKey;
    private bool $isProduction;
    private string $snapUrl;

    public function __construct() {
        $this->serverKey = (string) config('services.midtrans.server_key', '');
        $this->clientKey = (string) config('services.midtrans.client_key', '');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);
        $this->snapUrl = (string) config(
            'services.midtrans.snap_url',
            $this->isProduction
                ? 'https://app.midtrans.com/snap/v1/transactions'
                : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
        );
    }
}
