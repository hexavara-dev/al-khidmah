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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('ref_id')->unique();
            $table->string('product_code');
            $table->string('customer_id');
            $table->string('type');
            $table->unsignedBigInteger('price');
            $table->tinyInteger('status')->default(0)->comment('0:PROCESS 1:SUCCESS 2:FAILED');
            $table->string('message')->nullable();
            $table->string('sn')->nullable()->comment('Serial number dari IAK');
            $table->string('tr_id')->nullable()->comment('IAK transaction ID');
            $table->string('rc', 10)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
