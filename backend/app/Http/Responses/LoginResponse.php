<?php
namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class LoginResponse
{
    /**
     * Başarılı giriş yanıtı döndür
     *
     * @param  string  $token
     * @return JsonResponse
     */
    public static function success(string $token): JsonResponse
    {
        return response()->json([
            'message' => 'Giriş başarılı',
            'token' => $token,
        ], 200);
    }

    /**
     * Geçersiz giriş mesajı döndür
     *
     * @return JsonResponse
     */
    public static function invalidCredentials(): JsonResponse
    {
        return response()->json([
            'message' => 'Geçersiz giriş bilgileri',
        ], 401);
    }


    /**
     * Parametre hatası mesajı döndür
     *
     * @return JsonResponse
     */
    public static function invalidParameters(): JsonResponse
    {
        return response()->json([
            'message' => 'Lütfen parametreleri doğru girin',
        ], 405);
    }
}
