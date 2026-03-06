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

test('can store a meal', function () {
    $this->mock(\App\Services\CloudinaryService::class)
    ->shouldReceive('upload')
    ->once()
    ->andReturn('daily-meals/test123')
    ->shouldReceive('getUrl')
    ->andReturn('https://res.cloudinary.com/fake/image/upload/daily-meals/test123')
    ->shouldReceive('getThumbnailUrl')
    ->andReturn('https://res.cloudinary.com/fake/image/upload/c_fill,h_300,w_300/daily-meals/test123');

    $response = $this->postJson('/api/meals', [
        'photo' => \Illuminate\Http\UploadedFile::fake()->image('food.jpg'),
        'meal_type' => 2,
        'remark' => 'Test meal',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('data.meal_type_label', 'lunch');
});

test('can delete a meal', function () {
    $meal = Meal::factory()->create();

    $this->mock(\App\Services\CloudinaryService::class)
         ->shouldReceive('delete')
         ->once()
         ->andReturn(true);

    $response = $this->deleteJson("/api/meals/{$meal->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('meals', ['id' => $meal->id]);
});