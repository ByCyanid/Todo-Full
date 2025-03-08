<?php

namespace App\DTOs;

class TodoDTO
{
    public function __construct(
        public string $title,
        public ?string $description,
        public string $priority,
        public int $project_id,
        public int $user_id,
        public ?string $status = 'bekliyor'  // 📌 `status` alanını varsayılan olarak 'bekliyor' yap
    ) {}

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'project_id' => $this->project_id,
            'user_id' => $this->user_id,
            'status' => $this->status,  // 📌 `status` alanını diziye ekle
        ];
    }
}
