<?php

namespace App\Policies;

use App\Models\Potrero;
use App\Models\User;

class PotreroPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('potreros.view');
    }

    public function view(User $user, Potrero $potrero): bool
    {
        return $user->can('potreros.view');
    }

    public function create(User $user): bool
    {
        return $user->can('potreros.create');
    }

    public function update(User $user, Potrero $potrero): bool
    {
        return $user->can('potreros.update');
    }

    public function delete(User $user, Potrero $potrero): bool
    {
        return $user->can('potreros.delete');
    }

    public function restore(User $user, Potrero $potrero): bool
    {
        return $user->can('potreros.restore');
    }

    public function activate(User $user, Potrero $potrero): bool
    {
        return $user->can('potreros.activate');
    }
}
