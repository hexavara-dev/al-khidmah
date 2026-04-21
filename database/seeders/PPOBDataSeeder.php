<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeds all Paket Data products from IAK, split by provider.
 * Run individually: php artisan db:seed --class=PPOBDataSeeder
 * Or run a single provider: php artisan db:seed --class=PPOBDataTelkomselSeeder
 */
class PPOBDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PPOBDataTelkomselSeeder::class,
            PPOBDataIndosatSeeder::class,
            PPOBDataXLSeeder::class,
            PPOBDataAxisSeeder::class,
            PPOBDataTriSeeder::class,
            PPOBDataSmartfrenSeeder::class,
        ]);
    }
}
