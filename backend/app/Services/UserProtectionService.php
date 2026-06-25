<?php

namespace App\Services;

use App\Models\User;

class UserProtectionService
{
    public static function isSelf(User $actor, User $target): bool
    {
        return $actor->id === $target->id;
    }

    public static function isLastActiveSuperAdmin(User $target): bool
    {
        if (! $target->hasRole('super-admin')) {
            return false;
        }

        return User::query()
            ->where('estado', true)
            ->whereHas('roles', fn ($query) => $query->where('name', 'super-admin'))
            ->count() <= 1;
    }

    public static function wouldRemoveLastSuperAdmin(User $target, array $newRoles): bool
    {
        if (! $target->hasRole('super-admin')) {
            return false;
        }

        if (in_array('super-admin', $newRoles, true)) {
            return false;
        }

        return self::isLastActiveSuperAdmin($target);
    }
}
