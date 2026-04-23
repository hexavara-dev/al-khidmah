<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PPOBPLNSeeder extends Seeder
{
    use PPOBSyncTrait;

    public function run(): void
    {
        $this->syncAndStore('pln', 'pln', 'nominal');
    }
}
