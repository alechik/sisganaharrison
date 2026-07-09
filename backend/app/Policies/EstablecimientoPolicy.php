<?php

namespace App\Policies;

use App\Models\Establecimiento;
use App\Models\User;

class EstablecimientoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('establecimientos.view');
    }

    public function view(User $user, Establecimiento $establecimiento): bool
    {
        return $user->can('establecimientos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('establecimientos.create');
    }

    public function update(User $user, Establecimiento $establecimiento): bool
    {
        return $user->can('establecimientos.update');
    }

    public function delete(User $user, Establecimiento $establecimiento): bool
    {
        return $user->can('establecimientos.delete');
    }

    public function restore(User $user, Establecimiento $establecimiento): bool
    {
        return $user->can('establecimientos.restore');
    }

    public function activate(User $user, Establecimiento $establecimiento): bool
    {
        return $user->can('establecimientos.activate');
    }
}
