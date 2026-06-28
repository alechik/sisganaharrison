<?php

namespace App\Policies;

use App\Models\Raza;
use App\Models\User;

class RazaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('razas.view');
    }

    public function view(User $user, Raza $raza): bool
    {
        return $user->can('razas.view');
    }

    public function create(User $user): bool
    {
        return $user->can('razas.create');
    }

    public function update(User $user, Raza $raza): bool
    {
        return $user->can('razas.update');
    }

    public function delete(User $user, Raza $raza): bool
    {
        return $user->can('razas.delete');
    }

    public function restore(User $user, Raza $raza): bool
    {
        return $user->can('razas.restore');
    }

    public function activate(User $user, Raza $raza): bool
    {
        return $user->can('razas.activate');
    }
}
