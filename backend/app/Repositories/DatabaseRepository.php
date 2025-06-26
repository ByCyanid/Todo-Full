<?php

namespace App\Repositories;


use App\Models\DatabaseModel;

class DatabaseRepository
{
    public function allByUser(int $userId)
    {
        return DatabaseModel::where('user_id', $userId)->get();
    }

    public function findById(int $id): ?DatabaseModel
    {
        return DatabaseModel::find($id);
    }

    public function create(array $data): DatabaseModel
    {
        return DatabaseModel::create($data);
    }

    public function update(DatabaseModel $database, array $data): DatabaseModel
    {
        $database->update($data);
        return $database;
    }

    public function delete(DatabaseModel $database): bool
    {
        return $database->delete();
    }
}
