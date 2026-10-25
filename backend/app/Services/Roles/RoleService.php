<?php

namespace App\Services\Roles;

use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleService
{
    /**
     * @return Collection<int, Role>
     */
    public function all(): Collection
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->with('permissions')
            ->orderBy('name')
            ->get();
    }

    public function find(int $id): Role
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->with('permissions')
            ->findOrFail($id);
    }

    /**
     * @param  list<string>  $permissions
     */
    public function syncPermissions(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $role->fresh(['permissions']);
    }

    /**
     * @return list<string>
     */
    public function permissionCatalog(): array
    {
        return Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();
    }
}
