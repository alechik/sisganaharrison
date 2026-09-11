<?php

namespace App\Policies;

use App\Models\OrdenCompra;
use App\Models\User;

class OrdenCompraPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('compras.view');
    }

    public function view(User $user, OrdenCompra $ordenCompra): bool
    {
        if (! $user->can('compras.view')) {
            return false;
        }

        if ($user->can('compras.authorize')) {
            return true;
        }

        return $ordenCompra->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('compras.create');
    }

    public function update(User $user, OrdenCompra $ordenCompra): bool
    {
        if (! $user->can('compras.update') || ! $ordenCompra->esModificable()) {
            return false;
        }

        if ($user->can('compras.authorize')) {
            return true;
        }

        return $ordenCompra->user_id === $user->id;
    }

    public function authorize(User $user, OrdenCompra $ordenCompra): bool
    {
        return $user->can('compras.authorize') && $ordenCompra->estaPendiente();
    }
}
