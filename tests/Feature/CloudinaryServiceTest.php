<?php

use App\Services\CloudinaryService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('can upload image to cloudinary', function () {
    Storage::fake('public');
    $file = UploadedFile::fake()->image('test.jpg');
    
    $service = new CloudinaryService();
    $publicId = $service->upload($file);
    
    expect($publicId)->toBeString()
        ->and($publicId)->toContain('daily-meals/');
})->skip('Requires Cloudinary credentials');

test('can generate thumbnail url', function () {
    $service = new CloudinaryService();
    $url = $service->getThumbnailUrl('daily-meals/test123');
    
    expect($url)->toContain('w_300,h_300');
})->skip('Requires Cloudinary credentials');