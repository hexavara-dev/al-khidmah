<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('ppob_service_details', 'ppob_service_products');
    }

    public function down(): void
    {
        Schema::rename('ppob_service_products', 'ppob_service_details');
    }
};
