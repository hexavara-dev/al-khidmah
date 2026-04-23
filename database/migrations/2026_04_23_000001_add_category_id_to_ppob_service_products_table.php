<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            $table->foreignUuid('category_id')
                  ->nullable()
                  ->after('ppob_service_id')
                  ->constrained('ppob_service_categories')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ppob_service_products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};
