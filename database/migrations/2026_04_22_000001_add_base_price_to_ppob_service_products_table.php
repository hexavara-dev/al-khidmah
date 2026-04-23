<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            // base_price = harga asli dari IAK, tidak boleh dijual di bawah ini
            $table->unsignedBigInteger('base_price')->default(0)->after('price');
        });

        // Seed base_price from existing price for rows that already exist
        \DB::statement('UPDATE ppob_service_products SET base_price = price WHERE base_price = 0');
    }

    public function down(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            $table->dropColumn('base_price');
        });
    }
};
