<?php

namespace App\Services;

use App\Repositories\DatabaseRepository;
use App\DTOs\DatabaseDTO;
use App\Models\DatabaseModel;

class DatabaseService
{
    protected $databaseRepository;

    public function __construct(DatabaseRepository $databaseRepository)
    {
        $this->databaseRepository = $databaseRepository;
    }

    public function getAllForUser(int $userId)
    {
        return $this->databaseRepository->allByUser($userId);
    }

    public function getById(int $id): ?DatabaseModel
    {
        return $this->databaseRepository->findById($id);
    }

    public function createDatabase(DatabaseDTO $dto): DatabaseModel
    {
        $data = [
            'name' => $dto->name,
            'description' => $dto->description,
            'tables' => $dto->tables,
            'relationships' => $dto->relationships,
            'user_id' => $dto->user_id,
        ];

        return $this->databaseRepository->create($data);
    }

    public function updateDatabase(DatabaseModel $database, DatabaseDTO $dto): DatabaseModel
    {
        $data = [
            'name' => $dto->name,
            'description' => $dto->description,
            'tables' => $dto->tables,
            'relationships' => $dto->relationships,
        ];

        return $this->databaseRepository->update($database, $data);
    }

    public function deleteDatabase(DatabaseModel $database): bool
    {
        return $this->databaseRepository->delete($database);
    }
}
