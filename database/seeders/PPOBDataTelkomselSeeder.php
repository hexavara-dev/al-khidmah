<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PPOBDataTelkomselSeeder extends Seeder
{
    use PPOBSyncTrait;

    public function run(): void
    {
        $this->syncAndStore('data', 'data', 'nominal', 'telkomsel');
    }
}
