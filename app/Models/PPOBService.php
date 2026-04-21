<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PPOBService extends Model
{
    /** @use HasFactory<\Database\Factories\PPOBServiceFactory> */
    use HasFactory, HasUuids;

    protected $table = 'ppob_services';

    protected $fillable = ['code', 'description'];

    public function categories(): HasMany
    {
        return $this->hasMany(PPOBServiceCategory::class, 'ppob_id');
    }
}
