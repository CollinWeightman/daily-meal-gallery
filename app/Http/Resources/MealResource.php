<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MealResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'meal_type' => $this->meal_type,
            'meal_type_label' => $this->meal_type_label,
            'remark' => $this->remark,
            'taken_at' => $this->taken_at?->toIso8601String(),
            'cloudinary_url' => app(\App\Services\CloudinaryService::class)->getUrl($this->cloudinary_public_id),
            'thumbnail_url' => app(\App\Services\CloudinaryService::class)->getThumbnailUrl($this->cloudinary_public_id),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
