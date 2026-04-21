<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PPOBServiceCategory extends Model
{
    /** @use HasFactory<\Database\Factories\PPOBServiceCategoryFactory> */
    use HasFactory, HasUuids;

    protected $table = 'ppob_service_categories';

    protected $fillable = [
        'name',
        'ppob_id',
    ];
}
