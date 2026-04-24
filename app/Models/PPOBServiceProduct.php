<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PPOBServiceProduct extends Model
{
    use HasUuids;

    protected $table = 'ppob_service_products';

    protected $fillable = [
        'ppob_service_id',
        'code',
        'label',
        'name',
        'price',
        'period',
        'type',
        'status',
        'fee',
        'komisi',
        'icon_url',
    ];

    protected function casts(): array
    {
        return [
            'price'  => 'integer',
            'fee'    => 'integer',
            'komisi' => 'integer',
            'status' => 'integer',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(PPOBService::class, 'ppob_service_id');
    }
}
