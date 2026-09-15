<?php

use App\Models\Meal;
use App\Models\User;
uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

test('can list meals', function () {
    Meal::factory(3)->hasPhotos(1)->create();  // 加 hasPhotos(1)

    $response = $this->getJson('/api/meals');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'data' => [
                     '*' => [
                         'id',
                         'meal_type',
                         'meal_type_label',
                         'photos' => [          // 改成 photos 陣列
                             '*' => [
                                 'id',
                                 'url',
                                 'thumbnail_url',
                             ]
                         ],
                         'remark',
                         'taken_at',
                         'created_at',
                         'updated_at',
                     ]
                 ],
                 'meta'
             ]);
});

test('can get single meal', function () {
    $meal = Meal::factory()->create(['meal_type' => 1]);
    $meal->photos()->create([
        'cloudinary_public_id' => 'daily-meals/test_show',
        'sort_order' => 0,
    ]);

    $this->mock(\App\Services\CloudinaryService::class)
        ->shouldReceive('getUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/daily-meals/test_show')
        ->shouldReceive('getThumbnailUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/c_fill,h_300,w_300/daily-meals/test_show');

    $response = $this->getJson("/api/meals/{$meal->id}");

    $response->assertStatus(200)
             ->assertJsonPath('data.meal_type_label', 'breakfast')
             ->assertJsonCount(1, 'data.photos')
             ->assertJsonPath('data.photos.0.url', 'https://res.cloudinary.com/fake/image/upload/daily-meals/test_show');
});

test('can store a meal with single photo', function () {
    $user = User::factory()->create();
    $this->mock(\App\Services\CloudinaryService::class)
        ->shouldReceive('upload')
        ->once()
        ->andReturn('daily-meals/test123')
        ->shouldReceive('getUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/daily-meals/test123')
        ->shouldReceive('getThumbnailUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/c_fill,h_300,w_300/daily-meals/test123');

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/meals', [
            'photos'    => [\Illuminate\Http\UploadedFile::fake()->image('food.jpg')],
            'meal_type' => 2,
            'remark'    => 'Test meal',
        ]);

    $response->assertStatus(201)
             ->assertJsonPath('data.meal_type_label', 'lunch')
             ->assertJsonCount(1, 'data.photos');

    $this->assertDatabaseHas('meal_photos', [
        'meal_id'              => $response->json('data.id'),
        'cloudinary_public_id' => 'daily-meals/test123',
        'sort_order'           => 0,
    ]);
});

test('can store a meal with multiple photos', function () {
    $user = User::factory()->create();
    $this->mock(\App\Services\CloudinaryService::class)
        ->shouldReceive('upload')
        ->twice()
        ->andReturn('daily-meals/photo_001', 'daily-meals/photo_002')
        ->shouldReceive('getUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/daily-meals/photo_001')
        ->shouldReceive('getThumbnailUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/c_fill,h_300,w_300/daily-meals/photo_001');

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/meals', [
            'photos' => [
                \Illuminate\Http\UploadedFile::fake()->image('food1.jpg'),
                \Illuminate\Http\UploadedFile::fake()->image('food2.jpg'),
            ],
            'meal_type' => 1,
            'remark'    => 'Two photos',
        ]);

    $response->assertStatus(201)
             ->assertJsonCount(2, 'data.photos');

    $mealId = $response->json('data.id');
    $this->assertDatabaseHas('meal_photos', [
        'meal_id'              => $mealId,
        'cloudinary_public_id' => 'daily-meals/photo_001',
        'sort_order'           => 0,
    ]);
    $this->assertDatabaseHas('meal_photos', [
        'meal_id'              => $mealId,
        'cloudinary_public_id' => 'daily-meals/photo_002',
        'sort_order'           => 1,
    ]);
});

test('can delete a meal with single photo', function () {
    $user = User::factory()->create();
    $meal = Meal::factory()->create();
    $meal->photos()->create([
        'cloudinary_public_id' => 'test/photo_abc',
        'sort_order' => 0,
    ]);

    $this->mock(\App\Services\CloudinaryService::class)
         ->shouldReceive('delete')
         ->once()
         ->with('test/photo_abc')
         ->andReturn(true);

    $this->actingAs($user, 'sanctum')
         ->deleteJson("/api/meals/{$meal->id}")
         ->assertStatus(204);

    $this->assertDatabaseMissing('meals', ['id' => $meal->id]);
    $this->assertDatabaseMissing('meal_photos', ['meal_id' => $meal->id]);
});

test('can delete a meal with multiple photos', function () {
    $user = User::factory()->create();
    $meal = Meal::factory()->create();
    $meal->photos()->create(['cloudinary_public_id' => 'test/photo_001', 'sort_order' => 0]);
    $meal->photos()->create(['cloudinary_public_id' => 'test/photo_002', 'sort_order' => 1]);

    $this->mock(\App\Services\CloudinaryService::class)
         ->shouldReceive('delete')
         ->twice()                          // 應該被呼叫兩次
         ->andReturn(true);

    $this->actingAs($user, 'sanctum')
         ->deleteJson("/api/meals/{$meal->id}")
         ->assertStatus(204);

    $this->assertDatabaseMissing('meals', ['id' => $meal->id]);
    $this->assertDatabaseMissing('meal_photos', ['meal_id' => $meal->id]);
});

test('accepts jpeg, png, and webp formats', function (string $extension) {
    $user = User::factory()->create();
    $this->mock(\App\Services\CloudinaryService::class)
        ->shouldReceive('upload')
        ->once()
        ->andReturn('daily-meals/test_mime')
        ->shouldReceive('getUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/daily-meals/test_mime')
        ->shouldReceive('getThumbnailUrl')
        ->andReturn('https://res.cloudinary.com/fake/image/upload/c_fill,h_300,w_300/daily-meals/test_mime');

    $photo = \Illuminate\Http\UploadedFile::fake()->image("test.$extension");

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/meals', [
        'photos' => [$photo],
        'meal_type' => 1,
    ]);

    $response->assertStatus(201);
})->with(['jpeg', 'png', 'webp']);

test('rejects non-allowed image formats', function () {
    $user = User::factory()->create();
    $gif = \Illuminate\Http\UploadedFile::fake()->image('test.gif');

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/meals', [
        'photos' => [$gif],
        'meal_type' => 1,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['photos.0']);
});