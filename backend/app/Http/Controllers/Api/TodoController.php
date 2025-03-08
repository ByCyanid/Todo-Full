<?php

namespace App\Http\Controllers\Api;

use App\DTOs\TodoDTO;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\TodoRequest;
use App\Http\Responses\TodoResponse;
use App\Services\TodoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function __construct(protected TodoService $todoService) {}

    // 🟢 Todo Listeleme
    public function index()
    {
        try {
            $todos = $this->todoService->getAllTodos();
            return TodoResponse::success($todos);
        } catch (\Exception $e) {
            throw new ApiException('Todo listesi getirilemedi.', 500);
        }
    }

    // 🟢 Todo Oluşturma
    public function store(TodoRequest $request)
    {
        try {
            // 🟢 DTO oluşturma
            $todoDTO = new TodoDTO(
                title: $request->title,
                description: $request->description,
                priority: $request->priority,
                project_id: $request->project_id,
                user_id: auth()->id(),
                status: $request->status ?? 'bekliyor'
            );

            // 🔄 DTO'yu array'e çevirerek gönder
            $todo = $this->todoService->createTodo($todoDTO->toArray());
            return TodoResponse::success($todo, 201);
        } catch (\Exception $e) {
            throw new ApiException('Todo oluşturulamadı.', 500);
        }
    }

    // 🟢 Todo Güncelleme
    public function update(TodoRequest $request, $id)
    {
        try {
            // 🟢 DTO oluşturma
            $todoDTO = new TodoDTO(
                title: $request->title ?? '',
                description: $request->description ?? '',
                priority: $request->priority ?? 'dusuk',
                project_id: $request->project_id ?? 0,
                user_id: auth()->id(),
                status: $request->status ?? 'bekliyor'
            );

            // 🔄 DTO'yu array'e çevirerek gönder
            $todo = $this->todoService->updateTodo($id, $todoDTO->toArray());
            return TodoResponse::success($todo);
        } catch (\Exception $e) {
            throw new ApiException('Todo güncellenemedi.', 500);
        }
    }

    public function updateStatus(TodoRequest $request, $id)
    {
        try {
            // 🟢 Status güncellemesi
            $todo = $this->todoService->updateTodoStatus($id, $request->status);
            return TodoResponse::success($todo, 'Todo durumu başarıyla güncellendi.');
        } catch (\Exception $e) {
            // 🔴 Hata durumu
            return TodoResponse::error('Todo durumu güncellenemedi.', 500);
        }
    }

    public function getTodosByProject(int $projectId): JsonResponse
    {
        try {
            // Todo'ları servisten al
            $todos = $this->todoService->getTodosByUserAndProject($projectId);

            if ($todos->isEmpty()) {
                return response()->json(['message' => 'No todos found for this project.'], 404);
            }

            return response()->json($todos, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
        }
    }
    // 🟢 Todo Silme
        public function destroy($id)
    {
        try {
            $this->todoService->deleteTodo($id);
            return TodoResponse::success([], 'Todo başarıyla silindi.');
        } catch (\Exception $e) {
            throw new ApiException('Todo silinemedi.', 500);
        }
    }
}
