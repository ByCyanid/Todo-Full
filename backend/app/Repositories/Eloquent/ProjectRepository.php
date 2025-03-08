<?php

namespace App\Repositories\Eloquent;

use App\Models\Project;
use App\DTOs\ProjectDTO;
use App\Repositories\Interfaces\ProjectRepositoryInterface;

class ProjectRepository implements ProjectRepositoryInterface
{
    public function create(ProjectDTO $projectDTO)
    {
        return Project::create($projectDTO->toArray());
    }

    public function getAll()
    {
        return Project::where('user_id', auth()->id())->get();
    }

    public function findById(int $id)
    {
        return Project::where('user_id', auth()->id())->findOrFail($id);
    }

    public function update(int $id, ProjectDTO $projectDTO)
    {
        $project = $this->findById($id);
        $project->update($projectDTO->toArray());
        return $project;
    }

    public function delete(int $id)
    {
        $project = $this->findById($id);
        $project->delete();
    }
}
