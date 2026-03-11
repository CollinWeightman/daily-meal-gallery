<?php

use App\Services\CloudinaryService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// skip
test('can upload image to cloudinary', function () {
    Storage::fake('public');
    $file = UploadedFile::fake()->image('test.jpg');
    
    $service = new CloudinaryService();
    $publicId = $service->upload($file);
    
    expect($publicId)->toBeString()
        ->and($publicId)->toContain('daily-meals/');
})->skip('Integration test - run manually via curl instead');

test('can generate thumbnail url', function () {
    $service = new CloudinaryService();
    $url = $service->getThumbnailUrl('daily-meals/test123');
    
    expect($url)->toBeString()
        ->and($url)->toContain('c_fill')
        ->and($url)->toContain('h_300')
        ->and($url)->toContain('w_300')
        ->and($url)->toContain('daily-meals/test123');
});