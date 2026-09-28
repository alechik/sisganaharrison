<?php

namespace App\Policies;

use App\Models\Medicamento;
use App\Models\User;

class MedicamentoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('medicamentos.view');
    }

    public function view(User $user, Medicamento $medicamento): bool
    {
        return $user->can('medicamentos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('medicamentos.create');
    }

    public function update(User $user, Medicamento $medicamento): bool
    {
        return $user->can('medicamentos.update');
    }

    public function delete(User $user, Medicamento $medicamento): bool
    {
        return $user->can('medicamentos.delete');
    }

    public function restore(User $user, Medicamento $medicamento): bool
    {
        return $user->can('medicamentos.restore');
    }

    public function activate(User $user, Medicamento $medicamento): bool
    {
        return $user->can('medicamentos.activate');
    }
}
