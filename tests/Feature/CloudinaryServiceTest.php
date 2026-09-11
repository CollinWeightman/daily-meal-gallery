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