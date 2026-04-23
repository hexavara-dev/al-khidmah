<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Dimensions;

class UpdateCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:2048',
                (new Dimensions)->minWidth(400)->minHeight(200)->maxWidth(1920)->maxHeight(1080),
            ],
            'target_amount' => 'sometimes|nullable|numeric|min:1',
            'category_id' => 'sometimes|required|exists:categories,id',
            'deadline' => 'sometimes|required|date',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'image.max' => 'Ukuran gambar maksimal 2 MB.',
            'image.dimensions' => 'Resolusi gambar harus antara 400×200 px hingga 1920×1080 px.',
        ];
    }
}

