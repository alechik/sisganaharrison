<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Usuario\StoreUserRequest;
use App\Http\Requests\Usuario\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->latest()
            ->paginate(10);

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
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
            'user' => new UserResource($user)
        ]);
    }
    public function update(UpdateUserRequest $request, User $user)
    {
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
            'message' => 'Usuario actualizado correctamente'
        ]);
    }

    public function changeStatus(User $user)
    {
        $user->estado = !$user->estado;
        $user->save();

        return response()->json([
            'message' => 'Estado actualizado'
        ]);
    }
}
