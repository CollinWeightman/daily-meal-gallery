<?php

use App\Models\Meal;

test('can list meals', function () {
    Meal::factory(3)->create();

    $response = $this->getJson('/api/meals');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'data' => [
                     '*' => [
                         'id',
                         'meal_type',
                         'meal_type_label',
                         'remark',
                         'taken_at',
                         'cloudinary_url',
                         'thumbnail_url',
                         'created_at',
                         'updated_at',
                     ]
                 ],
                 'meta'
             ]);
});

test('can get single meal', function () {
    $meal = Meal::factory()->create(['meal_type' => 1]);

    $response = $this->getJson("/api/meals/{$meal->id}");

    $response->assertStatus(200)
             ->assertJsonPath('data.meal_type_label', 'breakfast');
});