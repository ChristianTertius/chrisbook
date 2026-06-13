<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['paid', 'shipped', 'completed', 'cancelled'])],
            'courier' => ['nullable', 'string', 'max:100'],

            // resi wajib diisi kalo status diubah jadi shipped
            'tracking_number' => ['nullable', 'string', 'max:100', 'required_if:status,shipped'],
        ];
    }
}
