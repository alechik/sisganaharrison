<?php

namespace App\Policies;

use App\Models\Lote;
use App\Models\User;

class LotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('lotes.view');
    }

    public function view(User $user, Lote $lote): bool
    {
        return $user->can('lotes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('lotes.create');
    }

    public function update(User $user, Lote $lote): bool
    {
        return $user->can('lotes.update');
    }

    public function delete(User $user, Lote $lote): bool
    {
        return $user->can('lotes.delete');
    }

    public function restore(User $user, Lote $lote): bool
    {
        return $user->can('lotes.restore');
    }

    public function activate(User $user, Lote $lote): bool
    {
        return $user->can('lotes.activate');
    }
}
