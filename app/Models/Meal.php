<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Meal extends Model
{
    use HasFactory;

    protected $fillable = [
        'cloudinary_public_id',
        'meal_type',
        'remark',
        'taken_at',
    ];
    
    protected $casts = [
        'taken_at' => 'datetime',
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
}