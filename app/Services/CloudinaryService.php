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
        $result = Cloudinary::upload($file->getRealPath(), [
            'folder' => 'daily-meals',
            'transformation' => [
                'width' => 800,
                'crop' => 'limit',
                'fetch_format' => 'auto',
                'quality' => 'auto',
            ],
        ]);

        return $result->getPublicId();
    }

    /**
     * 刪除照片
     * 
     * @param string $publicId
     * @return bool
     */
    public function delete(string $publicId): bool
    {
        $result = Cloudinary::destroy($publicId);
        return $result['result'] === 'ok';
    }

    /**
     * 取得照片 URL
     * 
     * @param string $publicId
     * @param array $transforms
     * @return string
     */
    public function getUrl(string $publicId, array $transforms = []): string
    {
        return Cloudinary::getUrl($publicId, $transforms);
    }

    /**
     * 取得縮圖 URL
     * 
     * @param string $publicId
     * @return string
     */
    public function getThumbnailUrl(string $publicId): string
    {
        return $this->getUrl($publicId, [
            'crop' => 'fill',
            'width' => 300,
            'height' => 300,
        ]);
    }
}
