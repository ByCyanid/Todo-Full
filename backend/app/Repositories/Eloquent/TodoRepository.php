<?php

namespace App\Repositories\Eloquent;

use App\Models\Todo;
use App\DTOs\TodoDTO;
use App\Repositories\Interfaces\TodoRepositoryInterface;

class TodoRepository implements TodoRepositoryInterface
{
    public function create(TodoDTO $todoDTO)
    {
        return Todo::create($todoDTO->toArray());
    }

    public function getAll()
    {
        return Todo::where('user_id', auth()->id())->get();
    }

    public function findById(int $id)
    {
        return Todo::where('user_id', auth()->id())->findOrFail($id);
    }

    public function getByUserAndProject(int $userId, int $projectId)
    {
        return Todo::where('user_id', $userId)
            ->where('project_id', $projectId)
            ->get();
    }

    public function update(int $id, TodoDTO $todoDTO)
    {
        $todo = $this->findById($id);
        $todo->update($todoDTO->toArray());
        return $todo;
    }

    public function delete(int $id)
    {
        $todo = $this->findById($id);
        $todo->delete();
    }
}
