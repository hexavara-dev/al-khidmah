<?php

namespace Database\Seeders;

use App\Models\PPOBService;
use App\Models\PPOBServiceProduct;
use App\Services\IAKService;
use Illuminate\Support\Str;

/**
 * Shared logic for syncing PPOB products from IAK into the database.
 * Meant to be used via `use PPOBSyncTrait;` inside a Seeder class.
 */
trait PPOBSyncTrait
{
    /**
     * Fetch active products from IAK, optionally filter by provider keyword,
     * then upsert into ppob_service_products.
     *
     * @param  string       $serviceCode     ppob_services.code (pulsa|data|pln|emoney)
     * @param  string       $iakType         IAK pricelist type (pulsa|data|pln|etoll)
     * @param  string       $nameFrom        'details_or_nominal' | 'nominal'
     * @param  string|null  $providerKeyword Case-insensitive substring of product_description
     */
    protected function syncAndStore(
        string $serviceCode,
        string $iakType,
        string $nameFrom,
        ?string $providerKeyword = null
    ): void {
        $service = PPOBService::where('code', $serviceCode)->first();

        if (! $service) {
            $this->command?->warn("PPOBService '{$serviceCode}' not found. Run PPOBServiceSeeder first.");
            return;
        }

        /** @var IAKService $iak */
        $iak      = app(IAKService::class);
        $response = $iak->priceList($iakType);
        $rawList  = $response['data']['pricelist'] ?? [];

        $items = collect($rawList)
            ->filter(fn ($item) => is_array($item) && ($item['status'] ?? '') === 'active')
            ->when($providerKeyword, fn ($c) => $c->filter(
                fn ($item) => str_contains(
                    strtolower((string) ($item['product_description'] ?? '')),
                    strtolower($providerKeyword)
                )
            ))
            ->map(fn ($item) => $this->transformItem($item, $nameFrom))
            ->values()
            ->toArray();

        if (empty($items)) {
            $label = $serviceCode . ($providerKeyword ? " / {$providerKeyword}" : '');
            $this->command?->warn("No active products found for {$label}.");
            return;
        }

        $this->upsertProducts($service, $items);

        $label = $serviceCode . ($providerKeyword ? " / {$providerKeyword}" : '');
        $this->command?->info('Synced ' . count($items) . " products for {$label}.");
    }

    private function transformItem(array $item, string $nameFrom): array
    {
        if ($nameFrom === 'details_or_nominal') {
            $details = trim((string) ($item['product_details'] ?? '-'));
            $name    = ($details !== '' && $details !== '-')
                ? $details
                : ($item['product_nominal'] ?? '');
        } else {
            $name = $item['product_nominal'] ?? '';
        }

        return [
            'code'   => $item['product_code']        ?? '',
            'label'  => $item['product_description'] ?? '',
            'name'   => $name,
            'price'  => (int) ($item['product_price']  ?? 0),
            'period' => (string) ($item['active_period'] ?? '0'),
            'type'   => $item['product_type']        ?? '',
            'fee'    => null,
        ];
    }

    private function upsertProducts(PPOBService $service, array $items): void
    {
        $now  = now();
        $rows = collect($items)->map(fn ($item) => [
            'id'              => (string) Str::uuid(),
            'ppob_service_id' => $service->id,
            'code'            => $item['code'],
            'label'           => $item['label'],
            'name'            => $item['name'],
            'price'           => $item['price'],
            'period'          => $item['period'],
            'type'            => $item['type'],
            'status'          => 1,
            'fee'             => $item['fee'] ?? null,
            'created_at'      => $now,
            'updated_at'      => $now,
        ])->toArray();

        PPOBServiceProduct::upsert(
            $rows,
            ['code'],
            ['label', 'name', 'price', 'period', 'type', 'fee', 'status', 'updated_at']
        );
    }
}
