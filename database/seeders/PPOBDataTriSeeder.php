<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PPOBDataTriSeeder extends Seeder
{
    use PPOBSyncTrait;

    public function run(): void
    {
        $this->syncAndStore('data', 'data', 'nominal', 'tri');
    }
}
