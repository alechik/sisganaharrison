<?php

namespace App\Policies;

use App\Models\Estancia;
use App\Models\User;

class EstanciaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('estancias.view');
    }

    public function view(User $user, Estancia $estancia): bool
    {
        return $user->can('estancias.view');
    }

    public function create(User $user): bool
    {
        return $user->can('estancias.create');
    }

    public function update(User $user, Estancia $estancia): bool
    {
        return $user->can('estancias.update');
    }

    public function delete(User $user, Estancia $estancia): bool
    {
        return $user->can('estancias.delete');
    }

    public function restore(User $user, Estancia $estancia): bool
    {
        return $user->can('estancias.restore');
    }

    public function activate(User $user, Estancia $estancia): bool
    {
        return $user->can('estancias.activate');
    }
}
