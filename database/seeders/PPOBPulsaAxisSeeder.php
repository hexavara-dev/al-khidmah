<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PPOBPulsaAxisSeeder extends Seeder
{
    use PPOBSyncTrait;

    public function run(): void
    {
        $this->syncAndStore('pulsa', 'pulsa', 'details_or_nominal', 'axis');
    }
}
