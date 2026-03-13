<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CloudinaryUsageController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Cache::remember('cloudinary_usage', 600, function () {
            $cloudName = env('CLOUDINARY_CLOUD_NAME');
            $apiKey    = env('CLOUDINARY_API_KEY');
            $apiSecret = env('CLOUDINARY_API_SECRET');

            $response = Http::withBasicAuth($apiKey, $apiSecret)
                ->get("https://api.cloudinary.com/v1_1/{$cloudName}/usage");

            if ($response->failed()) {
                return null;
            }

            $body = $response->json();

            return [
                'credits_used'         => $body['credits']['usage']      ?? 0,
                'credits_limit'        => $body['credits']['limit']       ?? 25,
                'storage_used_gb'      => round(($body['storage']['usage'] ?? 0) / 1073741824, 3),
                'bandwidth_used_gb'    => round(($body['bandwidth']['usage'] ?? 0) / 1073741824, 3),
                'transformations_used' => $body['transformations']['usage'] ?? 0,
            ];
        });

        if ($data === null) {
            return response()->json(['error' => 'Failed to fetch Cloudinary usage'], 503);
        }

        return response()->json($data);
    }
}