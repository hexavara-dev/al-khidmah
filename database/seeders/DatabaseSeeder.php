<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Donation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $users = collect([
            ['name' => 'Ahmad Fauzi', 'email' => 'ahmad@example.com'],
            ['name' => 'Siti Rahmah', 'email' => 'siti@example.com'],
            ['name' => 'Budi Santoso', 'email' => 'budi@example.com'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@example.com'],
            ['name' => 'Hasan Basri', 'email' => 'hasan@example.com'],
        ])->map(fn($u) => User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make('password'),
                'role' => 'user',
            ]));

        $categories = collect([
            'Pendidikan',
            'Kesehatan',
            'Bencana Alam',
            'Yatim & Dhuafa',
            'Masjid & Pesantren',
            'Lingkungan',
        ])->map(fn($name) => Category::create(['name' => $name]));

        // Campaigns
        $campaignData = [
            [
                'title' => 'Beasiswa Santri Berprestasi 2024',
                'description' => 'Program beasiswa untuk santri berprestasi yang membutuhkan bantuan biaya pendidikan. Dana akan digunakan untuk membayar biaya pesantren, buku, dan kebutuhan belajar lainnya.',
                'target_amount' => 50000000,
                'category_id' => $categories[0]->id,
                'deadline' => now()->addMonths(3)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Operasi Katarak Gratis untuk Dhuafa',
                'description' => 'Bantu sesama yang menderita katarak namun tidak mampu membiayai operasi. Satu donasi Anda bisa mengembalikan penglihatan saudara kita.',
                'target_amount' => 75000000,
                'category_id' => $categories[1]->id,
                'deadline' => now()->addMonths(2)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Bantuan Korban Banjir Kalimantan',
                'description' => 'Musibah banjir melanda ribuan keluarga di Kalimantan. Mari bersama bantu mereka dengan paket sembako, pakaian layak pakai, dan kebutuhan darurat lainnya.',
                'target_amount' => 100000000,
                'category_id' => $categories[2]->id,
                'deadline' => now()->addMonth()->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Santunan Anak Yatim Idul Fitri',
                'description' => 'Berikan kebahagiaan Idul Fitri untuk anak-anak yatim di seluruh Indonesia. Setiap anak berhak merasakan kegembiraan hari raya.',
                'target_amount' => 30000000,
                'category_id' => $categories[3]->id,
                'deadline' => now()->addMonths(4)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Renovasi Masjid Al-Ikhlas Pelosok Desa',
                'description' => 'Masjid Al-Ikhlas di pelosok desa Jawa Timur membutuhkan renovasi mendesak. Atap bocor dan dinding retak membuat jamaah tidak nyaman beribadah.',
                'target_amount' => 120000000,
                'category_id' => $categories[4]->id,
                'deadline' => now()->addMonths(6)->toDateString(),
                'is_active' => true,
            ],
            [
                'title' => 'Penanaman 10.000 Pohon Mangrove',
                'description' => 'Program penghijauan pesisir untuk mencegah abrasi dan menjaga ekosistem laut. Mari jaga bumi kita untuk generasi mendatang.',
                'target_amount' => 25000000,
                'category_id' => $categories[5]->id,
                'deadline' => now()->addMonths(5)->toDateString(),
                'is_active' => true,
            ],
        ];

        $campaigns = collect($campaignData)->map(fn($c) => Campaign::create($c));

        // Donations
        $paymentMethods = ['transfer_bank', 'gopay', 'ovo', 'dana', 'qris'];
        $statuses = ['pending', 'success', 'success', 'success', 'failed'];
        $amounts = [50000, 100000, 150000, 200000, 500000, 1000000];

        foreach ($users as $user) {
            foreach ($campaigns->random(3) as $campaign) {
                $status = $statuses[array_rand($statuses)];
                $amount = $amounts[array_rand($amounts)];

                Donation::create([
                    'user_id' => $user->id,
                    'campaign_id' => $campaign->id,
                    'amount' => $amount,
                    'status' => $status,
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'note' => 'Semoga bermanfaat',
                ]);

                if ($status === 'success') {
                    $campaign->increment('collected_amount', $amount);
                }
            }
        }
    }
}
