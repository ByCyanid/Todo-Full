<?php

namespace App\Repositories\Interfaces;

use App\DTOs\TodoDTO;

interface TodoRepositoryInterface
{
    public function create(TodoDTO $todoDTO);
    public function getAll();
    public function findById(int $id);
    public function update(int $id, TodoDTO $todoDTO);
    public function delete(int $id);
    public function getByUserAndProject(int $userId, int $projectId);
}
