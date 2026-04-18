<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'ref_id',
        'product_code',
        'customer_id',
        'customer_name',
        'segment_power',
        'type',
        'price',
        'snap_token',
        'payment_status',
        'status',
        'message',
        'sn',
        'tr_id',
        'rc',
    ];

    protected $casts = [
        'status' => 'integer',
        'price'  => 'integer',
    ];
}
