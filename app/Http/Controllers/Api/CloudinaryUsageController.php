<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use App\Services\CloudinaryService;


class CloudinaryUsageController extends Controller
{
    public function index(CloudinaryService $cloudinary): JsonResponse
    {
        $data = Cache::remember('cloudinary_usage', 600, fn() => $cloudinary->getUsage());
    
        if ($data === null) {
            return response()->json(['error' => 'Failed to fetch Cloudinary usage'], 503);
        }
    
        return response()->json($data);
    }
}