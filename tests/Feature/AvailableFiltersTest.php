<?php

use App\Models\Meal;
uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns empty years when no meals exist', function () {
    $this->getJson('/api/meals/available-filters')
        ->assertOk()
        ->assertJson(['years' => []]);
});

test('returns correct years and months', function () {
    Meal::factory()->create(['taken_at' => '2025-11-15 12:00:00']);
    Meal::factory()->create(['taken_at' => '2025-12-01 12:00:00']);
    Meal::factory()->create(['taken_at' => '2026-02-10 12:00:00']);

    $response = $this->getJson('/api/meals/available-filters')->assertOk();

    $years = collect($response->json('years'));

    expect($years)->toHaveCount(2);

    $y2026 = $years->firstWhere('year', 2026);
    expect($y2026['months'])->toBe([2]);

    $y2025 = $years->firstWhere('year', 2025);
    expect($y2025['months'])->toBe([11, 12]);
});