<?php

namespace App\Policies;

use App\Models\Presentacion;
use App\Models\User;

class PresentacionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('presentaciones.view');
    }

    public function view(User $user, Presentacion $presentacion): bool
    {
        return $user->can('presentaciones.view');
    }

    public function create(User $user): bool
    {
        return $user->can('presentaciones.create');
    }

    public function update(User $user, Presentacion $presentacion): bool
    {
        return $user->can('presentaciones.update');
    }

    public function delete(User $user, Presentacion $presentacion): bool
    {
        return $user->can('presentaciones.delete');
    }

    public function restore(User $user, Presentacion $presentacion): bool
    {
        return $user->can('presentaciones.restore');
    }
}
