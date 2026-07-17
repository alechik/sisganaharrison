<?php

namespace App\Policies;

use App\Models\Pesaje;
use App\Models\User;

class PesajePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('pesajes.view');
    }

    public function view(User $user, Pesaje $pesaje): bool
    {
        return $user->can('pesajes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('pesajes.create');
    }
}
