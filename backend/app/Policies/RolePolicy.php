<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->gestionaRoles($user);
    }

    public function view(User $user, Role $role): bool
    {
        return $this->gestionaRoles($user);
    }

    public function update(User $user, Role $role): bool
    {
        if (! $this->gestionaRoles($user)) {
            return false;
        }

        if ($role->name === 'administrador' && ! $user->hasRole('administrador')) {
            return false;
        }

        return true;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function delete(User $user, Role $role): bool
    {
        return false;
    }

    private function gestionaRoles(User $user): bool
    {
        return $user->hasAnyRole(['administrador', 'gerencia']);
    }
}
