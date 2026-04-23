<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PPOBServiceCategory extends Model
{
    /** @use HasFactory<\Database\Factories\PPOBServiceCategoryFactory> */
    use HasFactory, HasUuids;

    protected $table = 'ppob_service_categories';

    protected $fillable = [
        'name',
        'ppob_id',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(PPOBService::class, 'ppob_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(PPOBServiceProduct::class, 'category_id');
    }
}
