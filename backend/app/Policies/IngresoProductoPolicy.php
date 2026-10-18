<?php

namespace App\Policies;

use App\Models\IngresoProducto;
use App\Models\User;

class IngresoProductoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('compras_productos.view');
    }

    public function view(User $user, IngresoProducto $ingresoProducto): bool
    {
        return $user->can('compras_productos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('compras_productos.create');
    }
}
