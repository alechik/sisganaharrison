<?php

namespace App\Policies;

use App\Models\Gestacion;
use App\Models\User;

class GestacionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('reproduccion.view');
    }

    public function view(User $user, Gestacion $gestacion): bool
    {
        return $user->can('reproduccion.view');
    }

    public function create(User $user): bool
    {
        return $user->can('reproduccion.create');
    }

    public function update(User $user, Gestacion $gestacion): bool
    {
        return $user->can('reproduccion.update');
    }
}
