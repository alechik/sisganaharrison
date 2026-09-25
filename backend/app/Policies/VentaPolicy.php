<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Venta;

class VentaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('ventas.view');
    }

    public function view(User $user, Venta $venta): bool
    {
        if (! $user->can('ventas.view')) {
            return false;
        }

        if ($user->can('ventas.authorize')) {
            return true;
        }

        return $venta->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('ventas.create');
    }

    public function update(User $user, Venta $venta): bool
    {
        if (! $user->can('ventas.update') || ! $venta->esModificable()) {
            return false;
        }

        if ($user->can('ventas.authorize')) {
            return true;
        }

        return $venta->user_id === $user->id;
    }

    public function authorize(User $user, Venta $venta): bool
    {
        return $user->can('ventas.authorize') && $venta->estaPendiente();
    }
}
