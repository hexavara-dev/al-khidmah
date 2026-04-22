<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PPOBEMoneySeeder extends Seeder
{
    use PPOBSyncTrait;

    public function run(): void
    {
        $this->syncAndStore('emoney', 'etoll', 'nominal');
    }
}
