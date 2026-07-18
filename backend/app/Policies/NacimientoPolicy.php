<?php

namespace App\Policies;

use App\Models\Nacimiento;
use App\Models\User;

class NacimientoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('reproduccion.view');
    }

    public function view(User $user, Nacimiento $nacimiento): bool
    {
        return $user->can('reproduccion.view');
    }

    public function create(User $user): bool
    {
        return $user->can('reproduccion.create');
    }

    public function update(User $user, Nacimiento $nacimiento): bool
    {
        return $user->can('reproduccion.update');
    }
}
