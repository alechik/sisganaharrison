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
    
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('usuarios', UserController::class);
    Route::patch(
        'usuarios/{user}/estado',
        [UserController::class, 'changeStatus']
    );
    Route::get('/roles', function () {
        return Role::all();
    })->middleware('auth:sanctum');
});
