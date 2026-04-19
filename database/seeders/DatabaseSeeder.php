<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'              => 'Admin',
                'password'          => bcrypt('12345678'),
                'is_admin'          => true,
                'email_verified_at' => now(),
            ]
        );

        // Regular test user
        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name'     => 'Test User',
                'password' => bcrypt('12345678'),
                'is_admin' => false,
            ]
        );
    }
}
