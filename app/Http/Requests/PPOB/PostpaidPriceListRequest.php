<?php

namespace App\Http\Requests\PPOB;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class PostpaidPriceListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $type = $this->input('type', $this->route('type'));

        if (is_string($type)) {
            $type = strtolower(trim($type));
        }

        $this->merge(['type' => $type]);
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:asuransi,bpjs,emoney,finance,gas,hp,internet,pajak-daerah,pajak-kendaraan,pbb,pdam,pln,tv',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Missing type parameter.',
            'type.in'       => 'Invalid type parameter. Allowed values: asuransi, bpjs, emoney, finance, gas, hp, internet, pajak-daerah, pajak-kendaraan, pbb, pdam, pln, tv',
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
