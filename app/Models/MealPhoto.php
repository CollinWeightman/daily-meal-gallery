<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealPhoto extends Model
{
    public $timestamps = false; // 只有 created_at，不需要 updated_at

    protected $fillable = [
        'meal_id',
        'cloudinary_public_id',
        'sort_order',
    ];

    public function meal(): BelongsTo
    {
        return $this->belongsTo(Meal::class);
    }
}