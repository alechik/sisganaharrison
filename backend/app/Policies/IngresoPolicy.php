<?php

namespace App\Policies;

use App\Models\Ingreso;
use App\Models\User;

class IngresoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('compras.view');
    }

    public function view(User $user, Ingreso $ingreso): bool
    {
        return $user->can('compras.view');
    }

    public function create(User $user): bool
    {
        return $user->can('compras.create');
    }
}
