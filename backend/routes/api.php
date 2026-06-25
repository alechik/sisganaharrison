<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Spatie\Permission\Models\Role;

/*
|--------------------------------------------------------------------------
| AUTH PUBLIC
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

/*
|--------------------------------------------------------------------------
| AUTH PRIVATE
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('auth')
    ->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

/*
|--------------------------------------------------------------------------
| USUARIOS Y ROLES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('usuarios/eliminados', [UserController::class, 'deleted'])
        ->middleware('permission:usuarios.view');

    Route::post('usuarios/{id}/restaurar', [UserController::class, 'restore'])
        ->middleware('permission:usuarios.restore');

    Route::get('usuarios', [UserController::class, 'index'])
        ->middleware('permission:usuarios.view');

    Route::post('usuarios', [UserController::class, 'store'])
        ->middleware('permission:usuarios.create');

    Route::get('usuarios/{user}', [UserController::class, 'show'])
        ->middleware('permission:usuarios.view');

    Route::put('usuarios/{user}', [UserController::class, 'update'])
        ->middleware('permission:usuarios.update');

    Route::patch('usuarios/{user}', [UserController::class, 'update'])
        ->middleware('permission:usuarios.update');

    Route::delete('usuarios/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:usuarios.delete');

    Route::patch('usuarios/{user}/estado', [UserController::class, 'changeStatus'])
        ->middleware('permission:usuarios.activate');

    Route::get('/roles', function () {
        return Role::all();
    })->middleware('permission:usuarios.view');
});
