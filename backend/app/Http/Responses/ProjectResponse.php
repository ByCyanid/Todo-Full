<?php
namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ProjectResponse
{
    public static function success($data = [], $message = 'İşlem başarılı', $code = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    public static function error($message = 'Bir hata oluştu', $code = 500): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], $code);
    }
}
