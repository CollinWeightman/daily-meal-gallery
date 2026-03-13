<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'meal_type' => ['sometimes', 'integer', 'in:1,2,3,4'],
            'remark'    => ['sometimes', 'nullable', 'string', 'max:1000'],
            'taken_at'  => ['sometimes', 'nullable', 'date'],
        ];
    }
}