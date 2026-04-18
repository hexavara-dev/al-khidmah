<?php

namespace App\Http\Requests\PPOB;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class InquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'         => 'required|string|in:pln_pasca,tv_pasca,internet_pasca',
            'customer_id'  => 'required|string|max:30',
            'product_code' => 'required|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'         => 'Tipe layanan wajib diisi.',
            'type.in'               => 'Tipe layanan tidak valid.',
            'customer_id.required'  => 'Nomor pelanggan wajib diisi.',
            'product_code.required' => 'Kode produk wajib diisi.',
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
