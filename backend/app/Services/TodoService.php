<?php

namespace App\Services;

use App\DTOs\TodoDTO;
use App\Repositories\Interfaces\TodoRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class TodoService
{
    public function __construct(protected TodoRepositoryInterface $todoRepository) {}

    public function createTodo(array $data)
    {
        $todoDTO = new TodoDTO(
            $data['title'],
            $data['description'] ?? null,
            $data['priority'],
            $data['project_id'],
            auth()->id()
        );
        return $this->todoRepository->create($todoDTO);
    }

    public function getAllTodos()
    {
        return $this->todoRepository->getAll();
    }

    public function getTodosByUserAndProject(int $projectId)
    {
        $user = Auth::user();  // Mevcut kullanıcıyı al

        // Kullanıcının projeye ait todo'larını getir
        $todos = $this->todoRepository->getByUserAndProject($user->id, $projectId);

        return $todos;
    }

    public function updateTodoStatus(int $id, string $status)
    {
        $todo = $this->todoRepository->findById($id);

        if (!$todo) {
            throw new \Exception('Todo bulunamadı.');
        }

        // 🔄 Status güncelleme
        $todo->update(['status' => $status]);

        return $todo;
    }
    public function updateTodo(int $id, array $data)
    {
        $todo = $this->todoRepository->findById($id);

        // Güncelleme için DTO oluştur
        $todoDTO = new TodoDTO(
            $data['title'] ?? $todo->title,
            $data['description'] ?? $todo->description,
            $data['priority'] ?? $todo->priority,
            $data['project_id'] ?? $todo->project_id,
            auth()->id()
        );

        // Durum ve Öncelik Kontrolü
        if (isset($data['status'])) {
            $allowedStatus = ['bekliyor', 'yapiliyor', 'iptal', 'tamamlandi'];
            if (in_array($data['status'], $allowedStatus)) {
                $todoDTO->status = $data['status'];
            }
        }

        return $this->todoRepository->update($id, $todoDTO);
    }

    public function deleteTodo(int $id)
    {
        $this->todoRepository->delete($id);
    }
}
