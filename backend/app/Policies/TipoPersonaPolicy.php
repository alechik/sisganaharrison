<?php

namespace App\Policies;

use App\Models\TipoPersona;
use App\Models\User;

class TipoPersonaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tipos_persona.view');
    }

    public function view(User $user, TipoPersona $tipoPersona): bool
    {
        return $user->can('tipos_persona.view');
    }

    public function create(User $user): bool
    {
        return $user->can('tipos_persona.create');
    }

    public function update(User $user, TipoPersona $tipoPersona): bool
    {
        return $user->can('tipos_persona.update');
    }

    public function delete(User $user, TipoPersona $tipoPersona): bool
    {
        return $user->can('tipos_persona.delete');
    }
}
