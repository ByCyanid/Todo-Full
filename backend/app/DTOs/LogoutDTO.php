<?php

namespace App\DTOs;

class LogoutDTO
{
    public function __construct(
        public ?string $token = null,  // Token, sadece giriş işleminde alınacak
        public ?string $message = null // Mesaj, çıkış işleminden sonra dönecek
    ) {}

    public function toArray(): array
    {
        return [
            'token' => $this->token,
            'message' => $this->message,
        ];
    }
}
