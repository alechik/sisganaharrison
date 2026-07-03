<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vacuna;

class VacunaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('vacunas.view');
    }

    public function view(User $user, Vacuna $vacuna): bool
    {
        return $user->can('vacunas.view');
    }

    public function create(User $user): bool
    {
        return $user->can('vacunas.create');
    }

    public function update(User $user, Vacuna $vacuna): bool
    {
        return $user->can('vacunas.update');
    }

    public function delete(User $user, Vacuna $vacuna): bool
    {
        return $user->can('vacunas.delete');
    }

    public function restore(User $user, Vacuna $vacuna): bool
    {
        return $user->can('vacunas.restore');
    }

    public function activate(User $user, Vacuna $vacuna): bool
    {
        return $user->can('vacunas.activate');
    }
}
