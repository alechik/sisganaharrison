<?php

namespace App\Http\Controllers\Api\Roles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Http\Resources\Roles\RoleResource;
use App\Services\Roles\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        private readonly RoleService $roleService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Role::class);

        return RoleResource::collection($this->roleService->all());
    }

    public function show(Role $role): RoleResource
    {
        $this->authorize('view', $role);

        $role->load('permissions');

        return new RoleResource($role);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $role = $this->roleService->syncPermissions(
            $role,
            $request->validated('permissions')
        );

        return response()->json([
            'message' => 'Permisos del rol actualizados correctamente',
            'data' => new RoleResource($role),
        ]);
    }

    public function permissions(): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        return response()->json([
            'data' => $this->roleService->permissionCatalog(),
        ]);
    }
}
