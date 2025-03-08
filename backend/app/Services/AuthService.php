<?php

namespace App\Services;

use App\DTOs\AuthDTO;
use App\Exceptions\LoginException;
use App\Repositories\AuthRepository;
use Exception;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    protected AuthRepository $authRepository;

    public function __construct(AuthRepository $authRepository)
    {
        $this->authRepository = $authRepository;
    }

    public function login(AuthDTO $authDTO): AuthDTO
    {
        // Parametrelerin doğruluğunu kontrol et
        if (empty($authDTO->email) || empty($authDTO->password)) {
            throw LoginException::invalidParameters(); // Yanlış parametreler
        }

        $user = $this->authRepository->findUserByEmail($authDTO->email);

        if (!$user || !$this->authRepository->validatePassword($user, $authDTO->password)) {
            throw LoginException::invalidCredentials(); // Geçersiz e-posta veya şifre
        }
        // Token oluştur ve DTO'ya ata
        $token = $user->createToken('API Token')->accessToken;
        $authDTO->token = $token;

        return $authDTO;
    }

    /**
     * Kullanıcıyı çıkış yaptıktan sonra işlem yapar.
     *
     * @return string
     * @throws Exception
     */
    public function logout(): string
    {
        try {
            // Kullanıcıyı buluyoruz
            $user = Auth::user();

            if ($user) {
                // Passport kullanarak geçerli token'ı geçersiz kıl
                $user->tokens->each(function ($token) {
                    $token->delete();  // Token'ı sil
                });

                return 'Başarıyla çıkış yaptınız.';
            } else {
                throw new Exception('Geçerli bir kullanıcı bulunamadı.');
            }
        } catch (Exception $e) {
            throw new Exception('Çıkış işlemi sırasında bir hata oluştu: ' . $e->getMessage());
        }
    }
}
