<?php

namespace App\Policies;

use App\Models\MovimientoInventario;
use App\Models\User;

class MovimientoInventarioPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('movimientos.view');
    }

    public function view(User $user, MovimientoInventario $movimientoInventario): bool
    {
        return $user->can('movimientos.view');
    }
}
