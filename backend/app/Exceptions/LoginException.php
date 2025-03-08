<?php
// app/Exceptions/LoginException.php

namespace App\Exceptions;

use Exception;

class LoginException extends Exception
{
    // Geçersiz giriş (yanlış e-posta veya şifre) durumu için mesaj
    public static function invalidCredentials()
    {
        return new self('Geçersiz e-posta veya şifre', 401);
    }


    // Yanlış parametreler durumu için mesaj
    public static function invalidParameters()
    {
        return new self('Lütfen parametreleri doğru girin', 405); // 405 Method Not Allowed
    }

    // Hata yanıtını döndürür
    public function render($request)
    {
        return response()->json([
            'error' => $this->getMessage(),
            'code' => $this->getCode(),
        ], $this->getCode());
    }
}


