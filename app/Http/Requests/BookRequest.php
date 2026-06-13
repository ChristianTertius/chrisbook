<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $bookId = $this->route('book')?->id;
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string'],
            'condition' => ['required', Rule::in(['new', 'like_new', 'good', 'fair'])],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['available', 'sold'])],
            'cover' => ['nullable', 'image', 'max:2048'],            // file cover utama
            'images' => ['nullable', 'array', 'max:8'],               // galeri
            'images.*' => ['image', 'max:2048'],
            'deleted_images' => ['nullable', 'array'],                // id BookImage yang dihapus
            'deleted_images.*' => ['integer', 'exists:book_images,id'],
        ];
    }
}
