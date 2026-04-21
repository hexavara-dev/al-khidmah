<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Campaign extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'description',
        'image',
        'target_amount',
        'collected_amount',
        'category_id',
        'deadline',
        'is_active',
    ];

    protected $appends = ['image_url', 'progress_percentage'];

    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:2',
            'collected_amount' => 'decimal:2',
            'deadline' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->target_amount <= 0) {
            return 0;
        }
        return min(100, ($this->collected_amount / $this->target_amount) * 100);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }
        return Storage::disk('public')->url($this->image);
    }
}
