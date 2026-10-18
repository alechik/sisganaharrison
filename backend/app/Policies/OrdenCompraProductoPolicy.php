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
        return $user->can('compras_productos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('compras_productos.create');
    }

    public function update(User $user, OrdenCompraProducto $ordenCompraProducto): bool
    {
        return $user->can('compras_productos.update') && $ordenCompraProducto->esModificable();
    }

    public function authorize(User $user, OrdenCompraProducto $ordenCompraProducto): bool
    {
        return $user->can('compras_productos.authorize') && $ordenCompraProducto->estaPendiente();
    }
}
