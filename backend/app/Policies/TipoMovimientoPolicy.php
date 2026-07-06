<?php

namespace App\Policies;

use App\Models\TipoMovimiento;
use App\Models\User;

class TipoMovimientoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tipos_movimientos.view');
    }

    public function view(User $user, TipoMovimiento $tipoMovimiento): bool
    {
        return $user->can('tipos_movimientos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('tipos_movimientos.create');
    }

    public function update(User $user, TipoMovimiento $tipoMovimiento): bool
    {
        return $user->can('tipos_movimientos.update');
    }

    public function delete(User $user, TipoMovimiento $tipoMovimiento): bool
    {
        return $user->can('tipos_movimientos.delete');
    }

    public function restore(User $user, TipoMovimiento $tipoMovimiento): bool
    {
        return $user->can('tipos_movimientos.restore');
    }

    public function activate(User $user, TipoMovimiento $tipoMovimiento): bool
    {
        return $user->can('tipos_movimientos.activate');
    }
}
