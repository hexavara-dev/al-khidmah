<?php

namespace App\Http\Requests\PPOB;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class TopUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id'  => 'required|string|max:50',
            'product_code' => 'required|string|max:50',
            'type'         => 'required|in:pulsa,data,pln,game,etoll,voucher,esim,esiminternational,international',
            'price'        => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required'  => 'customer_id wajib diisi.',
            'product_code.required' => 'product_code wajib diisi.',
            'type.required'         => 'type wajib diisi.',
            'type.in'               => 'Tipe produk tidak valid.',
            'price.required'        => 'price wajib diisi.',
            'price.integer'         => 'price harus berupa angka.',
            'price.min'             => 'price minimal 1.',
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
