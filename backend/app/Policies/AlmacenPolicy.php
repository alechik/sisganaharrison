<?php

namespace App\Policies;

use App\Models\Almacen;
use App\Models\User;

class AlmacenPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('almacenes.view');
    }

    public function view(User $user, Almacen $almacen): bool
    {
        return $user->can('almacenes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('almacenes.create');
    }

    public function update(User $user, Almacen $almacen): bool
    {
        return $user->can('almacenes.update');
    }

    public function delete(User $user, Almacen $almacen): bool
    {
        return $user->can('almacenes.delete');
    }

    public function restore(User $user, Almacen $almacen): bool
    {
        return $user->can('almacenes.restore');
    }

    public function activate(User $user, Almacen $almacen): bool
    {
        return $user->can('almacenes.activate');
    }
}
