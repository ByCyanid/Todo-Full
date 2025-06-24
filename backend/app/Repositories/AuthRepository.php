<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthRepository
{
    public function findUserByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function validatePassword(User $user, string $password): bool
    {
        return Hash::check($password, $user->password);
    }
    public function updatePassword(User $user, string $hashedPassword): void
    {
        $user->password = $hashedPassword;
        $user->save();
    }
}
