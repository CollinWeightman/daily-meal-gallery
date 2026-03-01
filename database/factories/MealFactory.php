<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Meal>
 */
class MealFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cloudinary_public_id' => 'sample_' . fake()->uuid(),
            'meal_type' => fake()->numberBetween(1, 4),
            'remark' => fake()->optional()->sentence(),
            'taken_at' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
