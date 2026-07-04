<?php

namespace App\Policies;

use App\Models\TipoEventoSanitario;
use App\Models\User;

class TipoEventoSanitarioPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tipos_eventos_sanitarios.view');
    }

    public function view(User $user, TipoEventoSanitario $tipoEventoSanitario): bool
    {
        return $user->can('tipos_eventos_sanitarios.view');
    }

    public function create(User $user): bool
    {
        return $user->can('tipos_eventos_sanitarios.create');
    }

    public function update(User $user, TipoEventoSanitario $tipoEventoSanitario): bool
    {
        return $user->can('tipos_eventos_sanitarios.update');
    }

    public function delete(User $user, TipoEventoSanitario $tipoEventoSanitario): bool
    {
        return $user->can('tipos_eventos_sanitarios.delete');
    }

    public function restore(User $user, TipoEventoSanitario $tipoEventoSanitario): bool
    {
        return $user->can('tipos_eventos_sanitarios.restore');
    }

    public function activate(User $user, TipoEventoSanitario $tipoEventoSanitario): bool
    {
        return $user->can('tipos_eventos_sanitarios.activate');
    }
}
