<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Meal extends Model
{
    use HasFactory;

    protected $fillable = [
        'meal_type',
        'remark',
        'taken_at',
    ];
    
    protected $casts = [
        'taken_at' => 'datetime',
        'meal_type' => 'integer',
    ];

    protected $appends = ['meal_type_label'];

    public function getMealTypeLabelAttribute(): string
    {
        return match($this->meal_type) {
            1 => 'breakfast',
            2 => 'lunch',
            3 => 'dinner',
            4 => 'snack',
            default => 'unknown',
        };
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MealPhoto::class)->orderBy('sort_order');
    }
}