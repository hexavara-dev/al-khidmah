<?php

namespace Database\Seeders;

use App\Models\PPOBService;
use Illuminate\Database\Seeder;

class PPOBServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['code' => 'pulsa',    'description' => 'Pulsa'],
            ['code' => 'data',     'description' => 'Paket Data'],
            ['code' => 'tv',       'description' => 'TV Kabel / Internet Rumah'],
            ['code' => 'pln',      'description' => 'PLN'],
            ['code' => 'emoney',   'description' => 'E-Money'],
        ];

        foreach ($services as $service) {
            PPOBService::firstOrCreate(
                ['code' => $service['code']],
                ['description' => $service['description']],
            );
        }
    }
}
