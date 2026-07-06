<?php

namespace App\Policies;

use App\Models\TipoAlerta;
use App\Models\User;

class TipoAlertaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tipos_alertas.view');
    }

    public function view(User $user, TipoAlerta $tipoAlerta): bool
    {
        return $user->can('tipos_alertas.view');
    }

    public function create(User $user): bool
    {
        return $user->can('tipos_alertas.create');
    }

    public function update(User $user, TipoAlerta $tipoAlerta): bool
    {
        return $user->can('tipos_alertas.update');
    }

    public function delete(User $user, TipoAlerta $tipoAlerta): bool
    {
        return $user->can('tipos_alertas.delete');
    }

    public function restore(User $user, TipoAlerta $tipoAlerta): bool
    {
        return $user->can('tipos_alertas.restore');
    }

    public function activate(User $user, TipoAlerta $tipoAlerta): bool
    {
        return $user->can('tipos_alertas.activate');
    }
}
