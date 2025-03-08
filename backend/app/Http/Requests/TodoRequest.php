<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // 🟢 Kullanıcı yetkisi kontrolü (Gerekirse değiştir)
        return true;
    }

    public function rules(): array
    {
        $method = $this->method();

        if ($method === 'PUT' && $this->routeIs('todos.updateStatus')) {
            // 🟢 Sadece `status` güncelleme için kurallar
            return [
                'status' => 'required|string|in:bekliyor,yapiliyor,iptal,tamamlandi,erteledi'
            ];
        }

        if ($method === 'POST') {
            // 🟢 Oluşturma işlemi kuralları
            return [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'priority' => 'required|in:dusuk,orta,yuksek',
                'project_id' => 'required|exists:projects,id',
                'status' => 'nullable|in:bekliyor,yapiliyor,iptal,tamamlandi,erteledi',
            ];
        } elseif (in_array($method, ['PUT', 'PATCH'])) {
            // 🟢 Güncelleme işlemi kuralları
            return [
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'priority' => 'nullable|in:dusuk,orta,yuksek',
                'project_id' => 'nullable|exists:projects,id',
                'status' => 'nullable|in:bekliyor,yapiliyor,iptal,tamamlandi,erteledi',
            ];
        }

        // 🟢 Diğer istekler için boş kurallar
        return [];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Başlık zorunludur.',
            'priority.required' => 'Öncelik seviyesi zorunludur.',
            'project_id.required' => 'Proje seçimi zorunludur.',
            'project_id.exists' => 'Seçilen proje mevcut değil.',
            'status.required' => 'Durum alanı zorunludur.',
            'status.in' => 'Geçersiz durum değeri.',
        ];
    }
}
