<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Fix campaigns.id — if it's not char/varchar, convert it to char(36) UUID
        $idType = strtolower((string) (DB::select("SHOW COLUMNS FROM campaigns WHERE Field = 'id'")[0]->Type ?? ''));

        if (str_contains($idType, 'char')) {
            // Already UUID type, just ensure target_amount is nullable
            Schema::table('campaigns', function (Blueprint $table) {
                $table->decimal('target_amount', 15, 2)->nullable()->change();
            });
            return;
        }

        // campaigns.id is integer — need to convert. Drop FK dependents first.
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Drop donations (FK to campaigns). Keep existing rows not needed since data is fresh dev env.
        Schema::dropIfExists('donations');

        // Recreate campaigns with proper UUID primary key
        Schema::dropIfExists('campaigns');
        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('image')->nullable();
            $table->decimal('target_amount', 15, 2)->nullable();
            $table->decimal('collected_amount', 15, 2)->default(0);
            $table->unsignedBigInteger('category_id');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->date('deadline');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Recreate donations with matching FK types
        // users.id is bigint, campaigns.id is now char(36)
        Schema::create('donations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->uuid('campaign_id');
            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->string('payment_method');
            $table->text('note')->nullable();
            $table->string('order_id')->nullable()->unique();
            $table->timestamps();
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        // Not reversible
    }
};
