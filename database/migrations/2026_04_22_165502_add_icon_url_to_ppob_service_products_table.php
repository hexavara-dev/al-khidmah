<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            $table->string('icon_url')->nullable()->after('fee');
        });
    }

    public function down(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            $table->dropColumn('icon_url');
        });
    }
};
