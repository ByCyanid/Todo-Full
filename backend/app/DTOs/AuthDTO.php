<?php

namespace App\DTOs;

class AuthDTO
{
    public function __construct(
        public string $email,
        public string $password,
        public ?string $token = null  // 📌 Token alanı, giriş başarılı olursa dolacak
    ) {}

    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'password' => $this->password,
            'token' => $this->token,
        ];
    }
}
