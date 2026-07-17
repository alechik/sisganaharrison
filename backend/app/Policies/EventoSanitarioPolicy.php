<?php

namespace App\Policies;

use App\Models\EventoSanitario;
use App\Models\User;

class EventoSanitarioPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('sanitario.view');
    }

    public function view(User $user, EventoSanitario $eventoSanitario): bool
    {
        return $user->can('sanitario.view');
    }

    public function create(User $user): bool
    {
        return $user->can('sanitario.create');
    }
}
