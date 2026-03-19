<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('user can login with correct credentials', function () {
    User::factory()->create([
        'email'    => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    $this->postJson('/api/login', [
        'email'    => 'test@example.com',
        'password' => 'password',
    ])->assertOk()->assertJsonStructure(['token', 'user']);
});

test('login fails with wrong credentials', function () {
    $this->postJson('/api/login', [
        'email'    => 'wrong@example.com',
        'password' => 'wrong',
    ])->assertUnauthorized();
});

test('authenticated user can logout', function () {
    $user  = User::factory()->create();
    $token = $user->createToken('auth_token')->plainTextToken;

    $this->withHeader('Authorization', "Bearer $token")
        ->postJson('/api/logout')
        ->assertNoContent();
});

test('unauthenticated request to protected route returns 401', function () {
    $this->postJson('/api/meals', ['meal_type' => 2])
        ->assertUnauthorized();
});

test('authenticated user can access protected route', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->deleteJson('/api/meals/999')
        ->assertNotFound();
});