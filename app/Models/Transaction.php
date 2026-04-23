<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasUuids;
    protected $fillable = [
        'user_id',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $casts = [
        'status' => 'integer',
        'price'  => 'integer',
    ];
}
