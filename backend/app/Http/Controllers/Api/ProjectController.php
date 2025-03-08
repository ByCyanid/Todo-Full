<?php

namespace App\Http\Controllers\Api;

use App\DTOs\ProjectDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectRequest;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function __construct(protected ProjectService $projectService) {}

    // 🟢 Proje Listeleme
    public function index(): JsonResponse
    {
        $projects = $this->projectService->getAllProjects();
        return response()->json($projects);
    }

    // 🟢 Proje Oluşturma
    public function store(ProjectRequest $request): JsonResponse
    {
        // 🟢 DTO oluşturma
        $projectDTO = new ProjectDTO(
            name: $request->name,
            user_id: auth()->id()
        );

        // 🔄 DTO'yu array'e çevirerek gönder
        $project = $this->projectService->createProject($projectDTO->toArray());
        return response()->json($project, 201);
    }

    // 🟢 Proje Güncelleme
    public function update(ProjectRequest $request, $id): JsonResponse
    {
        // 🟢 DTO oluşturma
        $projectDTO = new ProjectDTO(
            name: $request->name ?? '',
            user_id: auth()->id()
        );

        // 🔄 DTO'yu array'e çevirerek gönder
        $project = $this->projectService->updateProject($id, $projectDTO->toArray());
        return response()->json($project);
    }

    // 🟢 Proje Silme
    public function destroy($id): JsonResponse
    {
        $this->projectService->deleteProject($id);
        return response()->json(['message' => 'Proje başarıyla silindi.']);
    }
}
