<?php

namespace App\Policies;

use App\Models\ServicioReproductivo;
use App\Models\User;

class ServicioReproductivoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('reproduccion.view');
    }

    public function view(User $user, ServicioReproductivo $servicioReproductivo): bool
    {
        return $user->can('reproduccion.view');
    }

    public function create(User $user): bool
    {
        return $user->can('reproduccion.create');
    }

    public function update(User $user, ServicioReproductivo $servicioReproductivo): bool
    {
        return $user->can('reproduccion.update');
    }
}
