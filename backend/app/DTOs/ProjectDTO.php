<?php

namespace App\DTOs;

class ProjectDTO
{
    public function __construct(
        public string $name,
        public int $user_id
    ) {}

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'user_id' => $this->user_id,
        ];
    }
}
