<?php

namespace App\Policies;

use App\Models\Persona;
use App\Models\User;

class PersonaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('socios.view');
    }

    public function view(User $user, Persona $persona): bool
    {
        return $user->can('socios.view');
    }

    public function create(User $user): bool
    {
        return $user->can('socios.create');
    }

    public function update(User $user, Persona $persona): bool
    {
        return $user->can('socios.update');
    }

    public function delete(User $user, Persona $persona): bool
    {
        return $user->can('socios.delete');
    }

    public function restore(User $user, Persona $persona): bool
    {
        return $user->can('socios.restore');
    }

    public function activate(User $user, Persona $persona): bool
    {
        return $user->can('socios.activate');
    }
}
