<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ];
    }
    public function messages(): array
    {
        return [
            'email.required' => 'Lütfen e-posta adresinizi girin.',
            'email.email' => 'Geçersiz e-posta adresi.',
            'password.required' => 'Lütfen şifrenizi girin.',
            'password.min' => 'Şifreniz en az 6 karakter olmalıdır.',
        ];
    }
}
