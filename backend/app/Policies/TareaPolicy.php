<?php

namespace App\Policies;

use App\Models\Tarea;
use App\Models\User;

class TareaPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->puedeConsultar($user);
    }

    public function view(User $user, Tarea $tarea): bool
    {
        if ($this->gestionaTareas($user)) {
            return true;
        }

        return $this->esAsignado($user, $tarea);
    }

    public function create(User $user): bool
    {
        return $this->gestionaTareas($user);
    }

    public function update(User $user, Tarea $tarea): bool
    {
        return $this->esAsignado($user, $tarea) && ! $tarea->estaTerminada();
    }

    public function complete(User $user, Tarea $tarea): bool
    {
        return $this->esAsignado($user, $tarea) && ! $tarea->estaTerminada();
    }

    private function gestionaTareas(User $user): bool
    {
        return $user->hasAnyRole(['administrador', 'gerencia']);
    }

    private function puedeConsultar(User $user): bool
    {
        return $user->hasAnyRole(['administrador', 'gerencia', 'trabajador', 'veterinario']);
    }

    private function esAsignado(User $user, Tarea $tarea): bool
    {
        return $user->hasAnyRole(['trabajador', 'veterinario'])
            && (int) $tarea->user_trabajador_id === (int) $user->id;
    }
}
