<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        // 🟢 Kullanıcı yetkisi kontrolü (Gerekirse değiştir)
        return true;
    }

    public function rules(): array
    {
        $method = $this->method();

        if ($method === 'POST') {
            // 🟢 Proje oluşturma kuralları
            return [
                'name' => 'required|string|max:255',
            ];
        } elseif (in_array($method, ['PUT', 'PATCH'])) {
            // 🟢 Proje güncelleme kuralları
            return [
                'name' => 'nullable|string|max:255',
            ];
        }

        // 🟢 Diğer istekler için boş kurallar
        return [];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Proje adı zorunludur.',
        ];
    }
}
