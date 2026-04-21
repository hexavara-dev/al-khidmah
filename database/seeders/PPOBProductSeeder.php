<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Top-level PPOB product seeder — syncs all services from IAK.
 *
 * Usage:
 *   php artisan db:seed --class=PPOBProductSeeder          # all services
 *   php artisan db:seed --class=PPOBPulsaSeeder            # pulsa only
 *   php artisan db:seed --class=PPOBDataSeeder             # paket data only
 *   php artisan db:seed --class=PPOBPulsaTelkomselSeeder   # single provider
 */
class PPOBProductSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PPOBPulsaSeeder::class,
            PPOBDataSeeder::class,
            PPOBPLNSeeder::class,
            PPOBEMoneySeeder::class,
        ]);
    }
}
