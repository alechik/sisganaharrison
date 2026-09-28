<?php

namespace App\Policies;

use App\Models\Traspaso;
use App\Models\User;

class TraspasoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('traspasos.view');
    }

    public function view(User $user, Traspaso $traspaso): bool
    {
        return $user->can('traspasos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('traspasos.create');
    }

    public function update(User $user, Traspaso $traspaso): bool
    {
        return $user->can('traspasos.update')
            && $user->hasAnyRole(['administrador', 'gerencia']);
    }
}
