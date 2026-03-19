<?php

namespace Database\Factories;

use App\Models\Meal;
use Illuminate\Database\Eloquent\Factories\Factory;

class MealPhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'meal_id'              => Meal::factory(),
            'cloudinary_public_id' => 'sample_' . fake()->uuid(),
            'sort_order'           => 0,
        ];
    }
}