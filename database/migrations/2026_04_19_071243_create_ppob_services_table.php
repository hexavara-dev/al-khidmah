<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * EXAMPLE ==========
 * {
    "code": "BIZNET",
    "name": "BIZNET HOME",
    "komisi": 1500,
    "fee": 5000,
    "status": 1,
    "type": "tv",
    "category": "tv"
}

[1] ICONNET TV
{
    "code": "ICONNET",
    "name": "ICONNET TV",
    "komisi": 900,
    "fee": 3500,
    "status": 1,
    "type": "tv",
    "category": "tv"
}

{
    "product_code": "linkaja10a",
    "product_description": "LinkAja",
    "product_nominal": "LinkAja Rp 10.000. - Admin Rp 1.000",
    "product_details": "-",
    "product_price": 10000,
    "product_type": "etoll",
    "active_period": "0",
    "status": "active",
    "icon_url": "https://cdn.mobilepulsa.net/img/product/operator_list/120619111757-040319020726-linkaja.png",
    "product_category": "emoney"
}

{
    "product_code": "go45",
    "product_description": "GoPay E-Money",
    "product_nominal": "GO-PAY Rp 45.000",
    "product_details": "Topup saldo Go-Pay langsung ke nomor HP tujuan Anda",
    "product_price": 48000,
    "product_type": "etoll",
    "active_period": "0",
    "status": "active",
    "icon_url": "https://cdn.mobilepulsa.net/img/logo/pulsa/small/gopay.png",
    "product_category": "emoney"
}

{
    "product_code": "tseldatao10l",
    "product_description": "Telkomsel Paket Internet",
    "product_nominal": "Telkomsel Data ORBIT 10GB. 7 Hari (Bulan ke-4 dst.)",
    "product_details": "Telkomsel data khusus nomor ORBIT bulan ke-4 dst. Kuota 10GB masa aktif 7 hari",
    "product_price": 32500,
    "product_type": "data",
    "active_period": "7",
    "status": "active",
    "icon_url": "https://cdn.mobilepulsa.net/img/product/operator_list/021121032726-telkomsel-logo.png",
    "product_category": "data"
}

{
    "product_code": "tseldatair5",
    "product_description": "Telkomsel Paket Internet",
    "product_nominal": "Telkomsel Data Internet Roamax Asia Australia 5 GB / 30 Hari",
    "product_details": "Telkomsel Paket RoaMAX Internet Asia Australia 5GB 30 hari, berlaku di Asia Australia",
    "product_price": 350000,
    "product_type": "data",
    "active_period": "30",
    "status": "active",
    "icon_url": "https://cdn.mobilepulsa.net/img/product/operator_list/021121032726-telkomsel-logo.png",
    "product_category": "data"
}

{
    "product_code": "tseldataw1d",
    "product_description": "Telkomsel Paket Internet",
    "product_nominal": "PAKET WHATSAPP 1GB / 1 HARI",
    "product_details": "PAKET WHATSAPP 1GB / 1 HARI",
    "product_price": 6600,
    "product_type": "data",
    "active_period": "0",
    "status": "active",
    "icon_url": "https://cdn.mobilepulsa.net/img/product/operator_list/021121032726-telkomsel-logo.png",
    "product_category": "data"
}

{
    "product_code": "tseldata250MB",
    "product_description": "Telkomsel Paket Internet",
    "product_nominal": "250MB",
    "product_details": "DATA FLASH 250MB Semua jaringan bebas zona, masa aktif 7 hari",
    "product_price": 10000,
    "product_type": "data",
    "active_period": "7",
    "status": "active",
    "icon_url": "https://cdn.mobilepulsa.net/img/product/operator_list/021121032726-telkomsel-logo.png",
    "product_category": "data"
}

{
    "product_code": "htelkomsel15000",
    "product_description": "Telkomsel",
    "product_nominal": "15000",
    "product_details": "-",
    "product_price": 15350,
    "product_type": "pulsa",
    "active_period": "7",
    "status": "active",
    "icon_url": "https://cdn.mobilepulsa.net/img/product/operator_list/021121032722-telkomsel-logo.png",
    "product_category": "pulsa"
}

{
  "product_code": "hpln20000",
  "product_description": "PLN",
  "product_nominal": "20000",
  "product_details": "-",
  "product_price": 20500,
  "product_type": "pln",
  "active_period": "0",
  "status": "active",
  "icon_url": "https://cdn.mobilepulsa.net/img/logo/pulsa/small/listrik.png",
  "product_category": "pln"
}   
 *
 * **/

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ppob_services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ppob_services');
    }
};
