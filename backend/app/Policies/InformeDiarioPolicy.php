<?php

namespace App\Policies;

use App\Models\InformeDiario;
use App\Models\User;

class InformeDiarioPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->puedeConsultar($user);
    }

    public function view(User $user, InformeDiario $informeDiario): bool
    {
        if ($this->gestionaInformes($user)) {
            return true;
        }

        return $this->esAutor($user, $informeDiario);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('trabajador');
    }

    public function update(User $user, InformeDiario $informeDiario): bool
    {
        return $this->esAutor($user, $informeDiario) && ! $informeDiario->estaRevisado();
    }

    public function review(User $user, InformeDiario $informeDiario): bool
    {
        return $this->gestionaInformes($user);
    }

    public function listTrabajadores(User $user): bool
    {
        return $this->gestionaInformes($user);
    }

    public function pendientes(User $user): bool
    {
        return $this->gestionaInformes($user);
    }

    private function gestionaInformes(User $user): bool
    {
        return $user->hasAnyRole(['administrador', 'gerencia']);
    }

    private function puedeConsultar(User $user): bool
    {
        return $user->hasAnyRole(['administrador', 'gerencia', 'trabajador']);
    }

    private function esAutor(User $user, InformeDiario $informeDiario): bool
    {
        return $user->hasRole('trabajador')
            && (int) $informeDiario->user_trabajador_id === (int) $user->id;
    }
}
