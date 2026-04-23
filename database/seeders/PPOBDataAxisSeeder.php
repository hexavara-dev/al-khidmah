<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PPOBDataAxisSeeder extends Seeder
{
    use PPOBSyncTrait;

    public function run(): void
    {
        $this->syncAndStore('data', 'data', 'nominal', 'axis');
    }
}
