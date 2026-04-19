<?php

namespace App\Http\Requests\PPOB;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class PostpaidCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ref_id' => 'required|string|exists:transactions,ref_id',
        ];
    }

    public function messages(): array
    {
        return [
            'ref_id.required' => 'ref_id wajib diisi.',
            'ref_id.exists'   => 'Transaksi tidak ditemukan.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Bad Request',
            'errors'  => $validator->errors(),
        ], 400));
    }
}
