<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMealRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'photos'          => 'required|array|min:1|max:5',
            'photos.*'        => 'image|max:5120',
            'meal_type'       => 'required|integer|in:1,2,3,4',
            'remark'          => 'nullable|string|max:500',
            'taken_at'        => 'nullable|date',
        ];
    }
}
