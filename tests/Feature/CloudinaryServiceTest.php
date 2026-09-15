<?php

use App\Services\CloudinaryService;


test('can generate thumbnail url', function () {
    $service = new CloudinaryService();
    $url = $service->getThumbnailUrl('daily-meals/test123');
    
    expect($url)->toBeString()
        ->and($url)->toContain('c_fill')
        ->and($url)->toContain('h_300')
        ->and($url)->toContain('w_300')
        ->and($url)->toContain('daily-meals/test123');
});

test('picks width constraint when width is the short side (portrait)', function () {
    $service = new CloudinaryService();

    expect($service->shortSideDimensionConstraint(3024, 4032))
        ->toBe(['width' => 800]);
});

test('picks height constraint when height is the short side (landscape)', function () {
    $service = new CloudinaryService();

    expect($service->shortSideDimensionConstraint(4032, 3024))
        ->toBe(['height' => 800]);
});

test('picks width constraint for square images', function () {
    $service = new CloudinaryService();

    expect($service->shortSideDimensionConstraint(1000, 1000))
        ->toBe(['width' => 800]);
});