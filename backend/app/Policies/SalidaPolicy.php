<?php

namespace App\Policies;

use App\Models\Salida;
use App\Models\User;

class SalidaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('salidas.view');
    }

    public function view(User $user, Salida $salida): bool
    {
        return $user->can('salidas.view');
    }

    public function create(User $user): bool
    {
        return $user->can('salidas.create');
    }
}
