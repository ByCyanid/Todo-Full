<?php

namespace App\DTOs;

use Illuminate\Http\Request;

class ChangePasswordDTO
{
    public string $oldPassword;
    public string $newPassword;

    public function __construct(string $oldPassword, string $newPassword)
    {
        $this->oldPassword = $oldPassword;
        $this->newPassword = $newPassword;
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            $request->input('old_password'),
            $request->input('new_password'),
        );
    }
}
