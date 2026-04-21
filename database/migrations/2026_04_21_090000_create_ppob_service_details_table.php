<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ppob_service_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('label');
            $table->text('name');
            $table->unsignedInteger('price');
            $table->string('period')->default('0');
            $table->string('type');
            $table->boolean('status')->default(true);
            $table->unsignedInteger('fee')->nullable();
            $table->foreignUuid('ppob_service_id')
                    ->constrained('ppob_services')
                    ->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ppob_service_details');
    }
};
