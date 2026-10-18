<?php

namespace App\Policies;

use App\Models\OrdenCompraProducto;
use App\Models\User;

class OrdenCompraProductoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('compras_productos.view');
    }

    public function view(User $user, OrdenCompraProducto $ordenCompraProducto): bool
    {
        if (! $user->can('compras_productos.view')) {
            return false;
        }

        if ($user->can('compras_productos.authorize')) {
            return true;
        }

        return $ordenCompraProducto->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('compras_productos.create');
    }

    public function update(User $user, OrdenCompraProducto $ordenCompraProducto): bool
    {
        if (! $user->can('compras_productos.update') || ! $ordenCompraProducto->esModificable()) {
            return false;
        }

        if ($user->can('compras_productos.authorize')) {
            return true;
        }

        return $ordenCompraProducto->user_id === $user->id;
    }

    public function authorize(User $user, OrdenCompraProducto $ordenCompraProducto): bool
    {
        return $user->can('compras_productos.authorize') && $ordenCompraProducto->estaPendiente();
    }
}
