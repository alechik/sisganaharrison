<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('usuarios.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->can('usuarios.view');
    }

    public function create(User $user): bool
    {
        return $user->can('usuarios.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->can('usuarios.update');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->can('usuarios.delete');
    }

    public function restore(User $user, User $model): bool
    {
        return $user->can('usuarios.restore');
    }

    public function activate(User $user, User $model): bool
    {
        return $user->can('usuarios.activate');
    }
}
