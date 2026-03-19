<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;
uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns cloudinary usage data', function () {
    Http::fake([
        'api.cloudinary.com/*' => Http::response([
            'credits'         => ['usage' => 3, 'limit' => 25],
            'storage'         => ['usage' => 107374182],   // ~0.1 GB
            'bandwidth'       => ['usage' => 214748364],   // ~0.2 GB
            'transformations' => ['usage' => 50],
        ]),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/admin/cloudinary-usage')
        ->assertOk()
        ->assertJsonStructure([
            'credits_used', 'credits_limit',
            'storage_used_gb', 'bandwidth_used_gb', 'transformations_used',
        ]);
});

it('returns 503 when cloudinary api fails', function () {
    Http::fake([
        'api.cloudinary.com/*' => Http::response(null, 500),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/admin/cloudinary-usage')
        ->assertStatus(503)
        ->assertJsonPath('error', 'Failed to fetch Cloudinary usage');
});

it('requires auth for cloudinary usage', function () {
    $this->getJson('/api/admin/cloudinary-usage')->assertUnauthorized();
});