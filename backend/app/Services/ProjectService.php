<?php

namespace App\Services;

use App\DTOs\ProjectDTO;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Support\Facades\Auth;

class ProjectService
{
    public function __construct(protected ProjectRepositoryInterface $projectRepository) {}

    public function createProject(array $data)
    {
        // Giriş yapan kullanıcının ID'sini al
        $user = Auth::user()->id;
        // Eğer kullanıcı giriş yapmamışsa hata döndür
        if (!$user) {
            return response()->json(['message' => 'Kullanıcı giriş yapmamış.'], 401);
        }

        $projectDTO = new ProjectDTO($data['name'], $user);
        return $this->projectRepository->create($projectDTO);
    }

    public function getAllProjects()
    {
        return $this->projectRepository->getAll();
    }

    public function updateProject(int $id, array $data)
    {
        $user = Auth::user()->id;
        $projectDTO = new ProjectDTO($data['name'], $user);
        return $this->projectRepository->update($id, $projectDTO);
    }

    public function deleteProject(int $id)
    {
        $this->projectRepository->delete($id);
    }
}
