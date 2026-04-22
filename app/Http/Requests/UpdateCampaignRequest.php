<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'target_amount' => 'sometimes|required|numeric|min:1',
            'category_id' => 'sometimes|required|exists:categories,id',
            'deadline' => 'sometimes|required|date',
            'is_active' => 'boolean',
        ];
    }
}

