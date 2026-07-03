<?php

namespace App\Policies;

use App\Models\EstadoProductivo;
use App\Models\User;

class EstadoProductivoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('estados_productivos.view');
    }

    public function view(User $user, EstadoProductivo $estadoProductivo): bool
    {
        return $user->can('estados_productivos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('estados_productivos.create');
    }

    public function update(User $user, EstadoProductivo $estadoProductivo): bool
    {
        return $user->can('estados_productivos.update');
    }

    public function delete(User $user, EstadoProductivo $estadoProductivo): bool
    {
        return $user->can('estados_productivos.delete');
    }

    public function restore(User $user, EstadoProductivo $estadoProductivo): bool
    {
        return $user->can('estados_productivos.restore');
    }

    public function activate(User $user, EstadoProductivo $estadoProductivo): bool
    {
        return $user->can('estados_productivos.activate');
    }
}
