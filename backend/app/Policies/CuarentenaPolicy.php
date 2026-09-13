<?php

namespace App\Policies;

use App\Models\Cuarentena;
use App\Models\User;

class CuarentenaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('compras.view');
    }

    public function view(User $user, Cuarentena $cuarentena): bool
    {
        return $user->can('compras.view');
    }

    public function create(User $user): bool
    {
        return $user->can('compras.create');
    }

    public function update(User $user, Cuarentena $cuarentena): bool
    {
        return $user->can('compras.create') && $cuarentena->esModificable();
    }

    public function complete(User $user, Cuarentena $cuarentena): bool
    {
        return $this->update($user, $cuarentena);
    }
}
