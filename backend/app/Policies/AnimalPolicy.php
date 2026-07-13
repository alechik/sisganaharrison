<?php

namespace App\Policies;

use App\Models\Animal;
use App\Models\User;

class AnimalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('animales.view');
    }

    public function view(User $user, Animal $animal): bool
    {
        return $user->can('animales.view');
    }

    public function create(User $user): bool
    {
        return $user->can('animales.create');
    }

    public function update(User $user, Animal $animal): bool
    {
        return $user->can('animales.update');
    }

    public function delete(User $user, Animal $animal): bool
    {
        return $user->can('animales.delete');
    }

    public function restore(User $user, Animal $animal): bool
    {
        return $user->can('animales.restore');
    }

    public function activate(User $user, Animal $animal): bool
    {
        return $user->can('animales.activate');
    }
}
