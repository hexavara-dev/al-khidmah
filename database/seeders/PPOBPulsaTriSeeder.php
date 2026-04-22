<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PPOBPulsaTriSeeder extends Seeder
{
    use PPOBSyncTrait;

    public function run(): void
    {
        $this->syncAndStore('pulsa', 'pulsa', 'details_or_nominal', 'tri');
    }
}
