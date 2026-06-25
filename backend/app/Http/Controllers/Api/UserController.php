<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Usuario\StoreUserRequest;
use App\Http\Requests\Usuario\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserProtectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $users = $this->buildUserQuery($request)
            ->paginate($request->integer('per_page', 10));

        return UserResource::collection($users);
    }

    public function deleted(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $users = User::onlyTrashed()
            ->with('roles')
            ->latest('deleted_at')
            ->paginate($request->integer('per_page', 10));

        return UserResource::collection($users);
    }

    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        $user->load('roles');

        return new UserResource($user);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = User::create([
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'password' => bcrypt($request->password),
        ]);

        $user->syncRoles($request->roles);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => new UserResource($user->load('roles')),
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        if (UserProtectionService::wouldRemoveLastSuperAdmin($user, $request->roles)) {
            return response()->json([
                'message' => 'No se puede quitar el rol super-admin al último super-admin activo.',
            ], 403);
        }

        $data = [
            'nombre' => $request->nombre,
            'apellido' => $request->apellido,
            'email' => $request->email,
            'telefono' => $request->telefono,
        ];

        if ($request->password) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);
        $user->syncRoles($request->roles);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => new UserResource($user->load('roles')),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        if (UserProtectionService::isSelf($request->user(), $user)) {
            return response()->json([
                'message' => 'No puede eliminarse a sí mismo.',
            ], 403);
        }

        if (UserProtectionService::isLastActiveSuperAdmin($user)) {
            return response()->json([
                'message' => 'No se puede eliminar el último super-admin activo.',
            ], 403);
        }

        $user->estado = false;
        $user->save();
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente',
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $user);

        $user->restore();
        $user->load('roles');

        return response()->json([
            'message' => 'Usuario restaurado correctamente',
            'user' => new UserResource($user),
        ]);
    }

    public function changeStatus(Request $request, User $user): JsonResponse
    {
        $this->authorize('activate', $user);

        if (UserProtectionService::isSelf($request->user(), $user)) {
            return response()->json([
                'message' => 'No puede desactivarse a sí mismo.',
            ], 403);
        }

        $newEstado = ! $user->estado;

        if (! $newEstado && UserProtectionService::isLastActiveSuperAdmin($user)) {
            return response()->json([
                'message' => 'No se puede desactivar el último super-admin activo.',
            ], 403);
        }

        $user->estado = $newEstado;
        $user->save();

        if (! $newEstado) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Estado actualizado',
            'user' => new UserResource($user->load('roles')),
        ]);
    }

    private function buildUserQuery(Request $request)
    {
        $query = User::with('roles')->latest();

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($builder) use ($search) {
                $builder->where('nombre', 'like', "%{$search}%")
                    ->orWhere('apellido', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('estado')) {
            $query->where('estado', filter_var($request->estado, FILTER_VALIDATE_BOOLEAN));
        }

        return $query;
    }
}
