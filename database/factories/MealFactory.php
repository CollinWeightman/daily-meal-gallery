<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MealFactory extends Factory
{
    public function definition(): array
    {
        return [
            'meal_type' => fake()->numberBetween(1, 4),
            'remark'    => fake()->optional()->sentence(),
            'taken_at'  => fake()->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}