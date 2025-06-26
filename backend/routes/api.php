<?php


use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DatabaseController;

Route::middleware('auth:api')->group(function () {
    // Projects
    Route::apiResource('projects', ProjectController::class);
    Route::get('todos/{projectId}', [TodoController::class, 'getTodosByProject']);
    // Todos
    Route::put('/todos/{id}/status', [TodoController::class, 'updateStatus']);
    Route::apiResource('todos', TodoController::class);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/password', [AuthController::class, 'changePassword']);
});

Route::post('/login', [AuthController::class, 'login']);


Route::get('/yetkisiz', function () {
    if (!auth()->check()) {
        return response()->json([
            'error' => 'Unauthorized',
            'message' => 'Yetkisiz erişim. Lütfen giriş yapın.'
        ], 401);
    }
    return response()->json(['message' => 'Erişim başarılı.']);
})->name('yetkisiz');
Route::middleware('auth:api')->group(function () {
    Route::apiResource('databases', DatabaseController::class);
    Route::post('databases/{database}/save', [DatabaseController::class, 'saveAllChanges']);
    Route::get('databases/{database}/export', [DatabaseController::class, 'exportSchema']);
    Route::post('databases/{database}/import', [DatabaseController::class, 'importSchema']);
    Route::get('databases/{database}/sql', [DatabaseController::class, 'generateSQL']);
});
