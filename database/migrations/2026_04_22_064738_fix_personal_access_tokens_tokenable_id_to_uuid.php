<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ubah kolom tokenable_id dari bigint ke varchar(36) agar kompatibel dengan UUID.
     * Diperlukan karena User model menggunakan HasUuids (primary key UUID),
     * sementara morphs() secara default membuat tokenable_id sebagai bigint unsigned.
     */
    public function up(): void
    {
        // Hapus semua token lama (tidak bisa dipakai lagi karena ID-nya bigint)
        DB::table('personal_access_tokens')->truncate();

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Drop index morphs bawaan sebelum alter kolom
            $table->dropIndex('personal_access_tokens_tokenable_type_tokenable_id_index');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Ubah tokenable_id dari bigint unsigned ke string(36) untuk UUID
            $table->string('tokenable_id', 36)->change();
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            // Pasang kembali index
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }

    /**
     * Rollback: kembalikan ke bigint (standard morphs).
     */
    public function down(): void
    {
        DB::table('personal_access_tokens')->truncate();

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex('personal_access_tokens_tokenable_type_tokenable_id_index');
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->unsignedBigInteger('tokenable_id')->change();
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }
};
