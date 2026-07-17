<?php

namespace App\Policies;

use App\Models\Parto;
use App\Models\User;

class PartoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('reproduccion.view');
    }

    public function view(User $user, Parto $parto): bool
    {
        return $user->can('reproduccion.view');
    }

    public function create(User $user): bool
    {
        return $user->can('reproduccion.create');
    }

    public function update(User $user, Parto $parto): bool
    {
        return $user->can('reproduccion.update');
    }
}
