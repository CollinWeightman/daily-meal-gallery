<?php

use App\Models\Meal;
use Illuminate\Support\Facades\DB;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

test('database connection works', function () {
    expect(DB::connection()->getPdo())->toBeInstanceOf(PDO::class);
});

test('can create a meal record', function () {
    $meal = Meal::factory()->create(['meal_type' => 2]);
    expect($meal->meal_type_label)->toBe('lunch');
});

test('meal type label returns correct values', function () {
    $breakfast = Meal::factory()->create(['meal_type' => 1]);
    $lunch = Meal::factory()->create(['meal_type' => 2]);
    $dinner = Meal::factory()->create(['meal_type' => 3]);
    $snack = Meal::factory()->create(['meal_type' => 4]);

    expect($breakfast->meal_type_label)->toBe('breakfast')
        ->and($lunch->meal_type_label)->toBe('lunch')
        ->and($dinner->meal_type_label)->toBe('dinner')
        ->and($snack->meal_type_label)->toBe('snack');
});