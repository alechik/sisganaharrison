<?php

namespace App\Policies;

use App\Models\Grupo;
use App\Models\User;

class GrupoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('grupos.view');
    }

    public function view(User $user, Grupo $grupo): bool
    {
        return $user->can('grupos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('grupos.create');
    }

    public function update(User $user, Grupo $grupo): bool
    {
        return $user->can('grupos.update');
    }

    public function delete(User $user, Grupo $grupo): bool
    {
        return $user->can('grupos.delete');
    }

    public function restore(User $user, Grupo $grupo): bool
    {
        return $user->can('grupos.restore');
    }

    public function activate(User $user, Grupo $grupo): bool
    {
        return $user->can('grupos.activate');
    }
}
