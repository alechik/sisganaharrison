<?php

namespace App\Policies;

use App\Models\Parcela;
use App\Models\User;

class ParcelaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('parcelas.view');
    }

    public function view(User $user, Parcela $parcela): bool
    {
        return $user->can('parcelas.view');
    }

    public function create(User $user): bool
    {
        return $user->can('parcelas.create');
    }

    public function update(User $user, Parcela $parcela): bool
    {
        return $user->can('parcelas.update');
    }

    public function delete(User $user, Parcela $parcela): bool
    {
        return $user->can('parcelas.delete');
    }

    public function restore(User $user, Parcela $parcela): bool
    {
        return $user->can('parcelas.restore');
    }

    public function activate(User $user, Parcela $parcela): bool
    {
        return $user->can('parcelas.activate');
    }
}
