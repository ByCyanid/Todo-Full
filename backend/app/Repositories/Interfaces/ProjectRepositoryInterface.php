<?php

namespace App\Repositories\Interfaces;

use App\DTOs\ProjectDTO;

interface ProjectRepositoryInterface
{
    public function create(ProjectDTO $projectDTO);
    public function getAll();
    public function findById(int $id);
    public function update(int $id, ProjectDTO $projectDTO);
    public function delete(int $id);
}
