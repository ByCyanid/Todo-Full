<?php

namespace App\Http\Controllers\Api;

use App\DTOs\AuthDTO;
use App\Exceptions\LoginException;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Responses\LoginResponse;
use App\Services\AuthService;
use Exception;
use Illuminate\Http\JsonResponse;
class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Kullanıcı girişi yap
     *
     * @param  LoginRequest  $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // DTO oluşturuluyor
        $authDTO = new AuthDTO(
            email: $request->email,
            password: $request->password
        );

        try {
            // AuthService'den gelen token
            $authDTO = $this->authService->login($authDTO);

            // Başarılı login işlemi sonrası LoginResponse success metodunu kullanıyoruz
            return LoginResponse::success($authDTO->token);
        } catch (LoginException $e) {
            // LoginException türündeki hata mesajlarını döndürüyoruz
            return $e->render($request); // render metodu, JSON yanıtı döndürür
        } catch (\Exception $e) {
            // Genel hata durumu
            return response()->json([
                'message' => 'Bir hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout işlemi
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        try {
            // AuthService'den logout yanıtı
            $message = $this->authService->logout();

            // Başarılı çıkış işlemi sonrası success mesajı döndürüyoruz
            return response()->json([
                'message' => $message
            ]);
        } catch (Exception $e) {
            // Hata durumunda hata mesajı
            return response()->json([
                'error' => 'Çıkış sırasında bir hata oluştu: ' . $e->getMessage()
            ], 500);
        }
    }



}
