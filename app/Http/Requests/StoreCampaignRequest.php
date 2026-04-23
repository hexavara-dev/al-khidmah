<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Dimensions;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:2048',
                (new Dimensions)->minWidth(400)->minHeight(200)->maxWidth(1920)->maxHeight(1080),
            ],
            'target_amount' => 'nullable|numeric|min:1',
            'category_id' => 'required|exists:categories,id',
            'deadline' => 'required|date|after:today',
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
