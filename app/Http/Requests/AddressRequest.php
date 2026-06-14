<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'province' => ['required', 'string', 'max:100'],
            'province_id' => ['nullable', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:100'],
            'city_id' => ['required', 'string', 'max:20'], // wajib buat hitung ongkir
            'postal_code' => ['required', 'string', 'max:10'],
            'full_address' => ['required', 'string'],
            'is_default' => ['boolean'],
        ];
    }
}
