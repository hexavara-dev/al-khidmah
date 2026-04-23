<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeds all Pulsa products from IAK, split by provider.
 * Run individually: php artisan db:seed --class=PPOBPulsaSeeder
 * Or run a single provider: php artisan db:seed --class=PPOBPulsaTelkomselSeeder
 */
class PPOBPulsaSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PPOBPulsaTelkomselSeeder::class,
            PPOBPulsaIndosatSeeder::class,
            PPOBPulsaXLSeeder::class,
            PPOBPulsaAxisSeeder::class,
            PPOBPulsaTriSeeder::class,
            PPOBPulsaSmartfrenSeeder::class,
        ]);
    }
}
