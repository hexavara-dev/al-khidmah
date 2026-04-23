<?php

use App\Services\IAKService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Dump IAK pricelist JSON per-provider into txt files.
 *
 * Usage:
 *   php artisan ppob:debug-providers
 *
 * Output location: storage/app/debug/ppob/{folder}/
 *   _raw_response.txt  - raw API payload
 *   _summary.txt       - record count + provider list
 *   {provider}.txt     - products for that provider
 *                        (pulsa/data: 1 sample each; others: all records)
 */
Artisan::command('ppob:debug-providers', function () {
    /** @var IAKService $iak */
    $iak = app(IAKService::class);

    $targets = [
        // ── Phone-number services (1 sample per provider) ──────────
        [
            'folder'         => 'pulsa',
            'title'          => 'Pulsa',
            'type'           => 'pulsa',
            'mode'           => 'prepaid',
            'provider_field' => 'product_description',
            'sample_only'    => true,
        ],
        [
            'folder'         => 'paket_data',
            'title'          => 'Paket Data',
            'type'           => 'data',
            'mode'           => 'prepaid',
            'provider_field' => 'product_description',
            'sample_only'    => true,
        ],
        // ── Full dump services ──────────────────────────────────────
        [
            'folder'         => 'emoney',
            'title'          => 'E-Money',
            'type'           => 'etoll',
            'mode'           => 'prepaid',
            'provider_field' => 'product_description',
            'sample_only'    => false,
        ],
        [
            'folder'         => 'pln_prepaid',
            'title'          => 'PLN Prepaid (Token Listrik)',
            'type'           => 'pln',
            'mode'           => 'prepaid',
            'provider_field' => 'product_description',
            'sample_only'    => false,
        ],
        [
            'folder'         => 'tv_kabel',
            'title'          => 'TV Kabel',
            'type'           => 'tv',
            'mode'           => 'postpaid',
            'provider_field' => 'name',
            'sample_only'    => false,
        ],
    ];

    foreach ($targets as $target) {
        $this->info("Fetching {$target['title']}…");

        $response = $target['mode'] === 'prepaid'
            ? $iak->priceList($target['type'])
            : $iak->priceListPasca($target['type']);

        $data    = $response['data'] ?? [];
        $rawList = $target['mode'] === 'prepaid'
            ? ($data['pricelist'] ?? [])
            : ($data['pasca']    ?? []);

        $records = collect($rawList)->filter(fn ($item) => is_array($item))->values();

        $dir = storage_path('app/debug/ppob/' . $target['folder']);
        File::ensureDirectoryExists($dir);

        // Remove stale txt files from previous runs
        foreach (File::glob($dir . DIRECTORY_SEPARATOR . '*.txt') as $old) {
            File::delete($old);
        }

        // ── _raw_response.txt ─────────────────────────────────────
        File::put(
            $dir . '/_raw_response.txt',
            json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL
        );

        // ── Group by provider ──────────────────────────────────────
        $grouped = $records
            ->groupBy(function (array $item) use ($target) {
                $val = trim((string) ($item[$target['provider_field']] ?? ''));
                return $val !== '' ? $val : 'unknown';
            })
            ->sortKeys();

        // ── Per-provider files ─────────────────────────────────────
        foreach ($grouped as $providerName => $items) {
            $slug = Str::slug($providerName) ?: 'unknown';

            $lines = [
                str_repeat('=', 70),
                '  ' . strtoupper($target['title']) . ' — ' . $providerName,
                str_repeat('=', 70),
                '',
            ];

            if ($target['sample_only']) {
                // Only write 1 sample record + total count
                $lines[] = 'Total records in this provider : ' . $items->count();
                $lines[] = '';
                $lines[] = '[Sample — index 0]';
                $lines[] = json_encode($items->first(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                $lines[] = '';
            } else {
                $lines[] = 'Total records: ' . $items->count();
                $lines[] = '';
                foreach ($items->values() as $index => $item) {
                    $lines[] = "[{$index}]";
                    $lines[] = json_encode($item, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                    $lines[] = '';
                }
            }

            File::put($dir . '/' . $slug . '.txt', implode(PHP_EOL, $lines) . PHP_EOL);
        }

        // ── _summary.txt ───────────────────────────────────────────
        $summaryLines = [
            str_repeat('=', 70),
            '  ' . strtoupper($target['title']),
            str_repeat('=', 70),
            '',
            'Source type : ' . $target['type'],
            'Source mode : ' . $target['mode'],
            'Sample only : ' . ($target['sample_only'] ? 'yes (1 record per provider file)' : 'no (all records)'),
            'Generated at: ' . now()->toDateTimeString(),
            'Total records  : ' . $records->count(),
            'Total providers: ' . $grouped->count(),
            '',
            'Providers:',
        ];

        foreach ($grouped as $providerName => $items) {
            $slug = Str::slug($providerName) ?: 'unknown';
            $summaryLines[] = sprintf(
                '  - %-44s %3d record(s)  ->  %s.txt',
                $providerName,
                $items->count(),
                $slug
            );
        }

        File::put($dir . '/_summary.txt', implode(PHP_EOL, $summaryLines) . PHP_EOL);

        $this->line(sprintf(
            '  -> %d records, %d providers  =>  storage/app/debug/ppob/%s/',
            $records->count(),
            $grouped->count(),
            $target['folder']
        ));
    }

    $this->newLine();
    $this->info('Done. Files written to storage/app/debug/ppob/');
})->purpose('Dump IAK pricelist JSON per-provider into txt files');
