<?php

namespace App\DTOs;

class DatabaseDTO
{
    public ?int $id;
    public string $name;
    public ?string $description;
    public ?array $tables;
    public ?array $relationships;
    public int $user_id;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'];
        $this->description = $data['description'] ?? null;
        $this->tables = $data['tables'] ?? null;
        $this->relationships = $data['relationships'] ?? null;
        $this->user_id = $data['user_id'];
    }
}
