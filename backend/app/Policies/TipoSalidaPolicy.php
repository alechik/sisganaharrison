<?php

namespace App\Policies;

use App\Models\TipoSalida;
use App\Models\User;

class TipoSalidaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tipos_salidas.view');
    }

    public function view(User $user, TipoSalida $tipoSalida): bool
    {
        return $user->can('tipos_salidas.view');
    }

    public function create(User $user): bool
    {
        return $user->can('tipos_salidas.create');
    }

    public function update(User $user, TipoSalida $tipoSalida): bool
    {
        return $user->can('tipos_salidas.update');
    }

    public function delete(User $user, TipoSalida $tipoSalida): bool
    {
        return $user->can('tipos_salidas.delete');
    }

    public function restore(User $user, TipoSalida $tipoSalida): bool
    {
        return $user->can('tipos_salidas.restore');
    }
}
