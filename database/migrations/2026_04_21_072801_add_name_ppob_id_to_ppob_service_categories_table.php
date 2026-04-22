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
        Schema::table('ppob_service_categories', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->foreignUuid('ppob_id')->after('name')->constrained('ppob_services')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ppob_service_categories', function (Blueprint $table) {
            $table->dropForeign(['ppob_id']);
            $table->dropColumn(['name', 'ppob_id']);
        });
    }
};
