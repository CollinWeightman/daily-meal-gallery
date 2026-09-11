<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class CloudinaryService
{
    /**
     * 上傳照片到 Cloudinary
     * 
     * @param UploadedFile $file
     * @return string public_id
     */
    public function upload(UploadedFile $file): string
    {
        $result = app(\Cloudinary\Cloudinary::class)
            ->uploadApi()
            ->upload($file->getRealPath(), [
                'folder' => 'daily-meals',
                'transformation' => [
                    'width' => 800,
                    'crop' => 'limit',
                    'fetch_format' => 'auto',
                    'quality' => 'auto',
                ],
            ]);
    
        return $result['public_id'];
    }

    /**
     * 刪除照片
     * 
     * @param string $publicId
     * @return bool
     */
    public function delete(string $publicId): bool
    {
        $result = app(\Cloudinary\Cloudinary::class)
            ->uploadApi()
            ->destroy($publicId);
    
        return $result['result'] === 'ok';
    }

    /**
     * 取得照片 URL
     * 
     * @param string $publicId
     * @return string
     */
    public function getUrl(string $publicId): string
    {
        return (string) app(\Cloudinary\Cloudinary::class)->image($publicId)->toUrl();
    }
    

    /**
     * 取得縮圖 URL
     * 
     * @param string $publicId
     * @return string
     */
    public function getThumbnailUrl(string $publicId): string
    {
        return (string) app(\Cloudinary\Cloudinary::class)
            ->image($publicId)
            ->resize(\Cloudinary\Transformation\Resize::fill(300, 300))
            ->toUrl();
    }

    
    /**
     * 取得 Cloudinary 用量資訊
     *
     * @return array|null 用量資料，API 失敗時回傳 null
     */
    public function getUsage(): ?array
    {
        $config = app(\Cloudinary\Cloudinary::class)->configuration;

        $response = \Illuminate\Support\Facades\Http::withBasicAuth(
            $config->cloud->apiKey,
            $config->cloud->apiSecret
        )->get("https://api.cloudinary.com/v1_1/{$config->cloud->cloudName}/usage");

        if ($response->failed()) {
            return null;
        }

        $body = $response->json();

        return [
            'credits_used'         => $body['credits']['usage']          ?? 0,
            'credits_limit'        => $body['credits']['limit']           ?? 25,
            'storage_used_gb'      => round(($body['storage']['usage']    ?? 0) / 1073741824, 3),
            'bandwidth_used_gb'    => round(($body['bandwidth']['usage']  ?? 0) / 1073741824, 3),
            'transformations_used' => $body['transformations']['usage']   ?? 0,
        ];
    }
}
