<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\CloudinaryService;

class MealResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cloudinary = app(CloudinaryService::class);

        return [
            'id' => $this->id,
            'meal_type' => $this->meal_type,
            'meal_type_label' => $this->meal_type_label,
            'photos' => $this->photos->map(fn($photo) => [
                'id'            => $photo->id,
                'url'           => $cloudinary->getUrl($photo->cloudinary_public_id),
                'thumbnail_url' => $cloudinary->getThumbnailUrl($photo->cloudinary_public_id),
            ]),
            'remark' => $this->remark,
            'taken_at' => $this->taken_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}