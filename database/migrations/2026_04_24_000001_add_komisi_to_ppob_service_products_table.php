<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            // komisi = keuntungan platform per transaksi (dari IAK)
            $table->unsignedInteger('komisi')->default(0)->after('fee');
        });
    }

    public function down(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            $table->dropColumn('komisi');
        });
    }
};
