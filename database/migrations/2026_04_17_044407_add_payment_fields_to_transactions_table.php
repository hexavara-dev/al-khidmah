<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('snap_token')->nullable()->after('price');
            $table->string('payment_status')->default('pending')->after('snap_token')
                  ->comment('pending, settlement, capture, cancel, expire, deny');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['snap_token', 'payment_status']);
        });
    }
};
