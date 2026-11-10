<?php

namespace App\Policies;

use App\Models\TipoIngreso;
use App\Models\User;

class TipoIngresoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tipos_ingresos.view');
    }

    public function view(User $user, TipoIngreso $tipoIngreso): bool
    {
        return $user->can('tipos_ingresos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('tipos_ingresos.create');
    }

    public function update(User $user, TipoIngreso $tipoIngreso): bool
    {
        return $user->can('tipos_ingresos.update');
    }

    public function delete(User $user, TipoIngreso $tipoIngreso): bool
    {
        return $user->can('tipos_ingresos.delete');
    }

    public function restore(User $user, TipoIngreso $tipoIngreso): bool
    {
        return $user->can('tipos_ingresos.restore');
    }

    public function activate(User $user, TipoIngreso $tipoIngreso): bool
    {
        return $user->can('tipos_ingresos.activate');
    }
}
