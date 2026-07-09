<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\Razas\RazaController;
use App\Http\Controllers\Api\CategoriasAnimales\CategoriaAnimalController;
use App\Http\Controllers\Api\Vacunas\VacunaController;
use App\Http\Controllers\Api\EstadosProductivos\EstadoProductivoController;
use App\Http\Controllers\Api\TiposEventosSanitarios\TipoEventoSanitarioController;
use App\Http\Controllers\Api\TiposMovimientos\TipoMovimientoController;
use App\Http\Controllers\Api\TiposAlertas\TipoAlertaController;
use App\Http\Controllers\Api\Establecimientos\EstablecimientoController;
use App\Http\Controllers\Api\Potreros\PotreroController;
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

/*
|--------------------------------------------------------------------------
| RAZAS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('razas/eliminados', [RazaController::class, 'deleted'])
        ->middleware('permission:razas.view');

    Route::post('razas/{id}/restaurar', [RazaController::class, 'restore'])
        ->middleware('permission:razas.restore');

    Route::get('razas', [RazaController::class, 'index'])
        ->middleware('permission:razas.view');

    Route::post('razas', [RazaController::class, 'store'])
        ->middleware('permission:razas.create');

    Route::get('razas/{raza}', [RazaController::class, 'show'])
        ->middleware('permission:razas.view');

    Route::put('razas/{raza}', [RazaController::class, 'update'])
        ->middleware('permission:razas.update');

    Route::patch('razas/{raza}', [RazaController::class, 'update'])
        ->middleware('permission:razas.update');

    Route::delete('razas/{raza}', [RazaController::class, 'destroy'])
        ->middleware('permission:razas.delete');

    Route::patch('razas/{raza}/estado', [RazaController::class, 'changeStatus'])
        ->middleware('permission:razas.activate');
});

/*
|--------------------------------------------------------------------------
| CATEGORÍAS DE ANIMALES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('categorias-animales/eliminados', [CategoriaAnimalController::class, 'deleted'])
        ->middleware('permission:categorias_animales.view');

    Route::post('categorias-animales/{id}/restaurar', [CategoriaAnimalController::class, 'restore'])
        ->middleware('permission:categorias_animales.restore');

    Route::get('categorias-animales', [CategoriaAnimalController::class, 'index'])
        ->middleware('permission:categorias_animales.view');

    Route::post('categorias-animales', [CategoriaAnimalController::class, 'store'])
        ->middleware('permission:categorias_animales.create');

    Route::get('categorias-animales/{categoria}', [CategoriaAnimalController::class, 'show'])
        ->middleware('permission:categorias_animales.view');

    Route::put('categorias-animales/{categoria}', [CategoriaAnimalController::class, 'update'])
        ->middleware('permission:categorias_animales.update');

    Route::patch('categorias-animales/{categoria}', [CategoriaAnimalController::class, 'update'])
        ->middleware('permission:categorias_animales.update');

    Route::delete('categorias-animales/{categoria}', [CategoriaAnimalController::class, 'destroy'])
        ->middleware('permission:categorias_animales.delete');

    Route::patch('categorias-animales/{categoria}/estado', [CategoriaAnimalController::class, 'changeStatus'])
        ->middleware('permission:categorias_animales.activate');
});

/*
|--------------------------------------------------------------------------
| VACUNAS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('vacunas/eliminados', [VacunaController::class, 'deleted'])
        ->middleware('permission:vacunas.view');

    Route::post('vacunas/{id}/restaurar', [VacunaController::class, 'restore'])
        ->middleware('permission:vacunas.restore');

    Route::get('vacunas', [VacunaController::class, 'index'])
        ->middleware('permission:vacunas.view');

    Route::post('vacunas', [VacunaController::class, 'store'])
        ->middleware('permission:vacunas.create');

    Route::get('vacunas/{vacuna}', [VacunaController::class, 'show'])
        ->middleware('permission:vacunas.view');

    Route::put('vacunas/{vacuna}', [VacunaController::class, 'update'])
        ->middleware('permission:vacunas.update');

    Route::patch('vacunas/{vacuna}', [VacunaController::class, 'update'])
        ->middleware('permission:vacunas.update');

    Route::delete('vacunas/{vacuna}', [VacunaController::class, 'destroy'])
        ->middleware('permission:vacunas.delete');

    Route::patch('vacunas/{vacuna}/estado', [VacunaController::class, 'changeStatus'])
        ->middleware('permission:vacunas.activate');
});

/*
|--------------------------------------------------------------------------
| ESTADOS PRODUCTIVOS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('estados-productivos/eliminados', [EstadoProductivoController::class, 'deleted'])
        ->middleware('permission:estados_productivos.view');

    Route::post('estados-productivos/{id}/restaurar', [EstadoProductivoController::class, 'restore'])
        ->middleware('permission:estados_productivos.restore');

    Route::get('estados-productivos', [EstadoProductivoController::class, 'index'])
        ->middleware('permission:estados_productivos.view');

    Route::post('estados-productivos', [EstadoProductivoController::class, 'store'])
        ->middleware('permission:estados_productivos.create');

    Route::get('estados-productivos/{estado_productivo}', [EstadoProductivoController::class, 'show'])
        ->middleware('permission:estados_productivos.view');

    Route::put('estados-productivos/{estado_productivo}', [EstadoProductivoController::class, 'update'])
        ->middleware('permission:estados_productivos.update');

    Route::patch('estados-productivos/{estado_productivo}', [EstadoProductivoController::class, 'update'])
        ->middleware('permission:estados_productivos.update');

    Route::delete('estados-productivos/{estado_productivo}', [EstadoProductivoController::class, 'destroy'])
        ->middleware('permission:estados_productivos.delete');

    Route::patch('estados-productivos/{estado_productivo}/estado', [EstadoProductivoController::class, 'changeStatus'])
        ->middleware('permission:estados_productivos.activate');
});

/*
|--------------------------------------------------------------------------
| TIPOS DE EVENTOS SANITARIOS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('tipos-eventos-sanitarios/eliminados', [TipoEventoSanitarioController::class, 'deleted'])
        ->middleware('permission:tipos_eventos_sanitarios.view');

    Route::post('tipos-eventos-sanitarios/{id}/restaurar', [TipoEventoSanitarioController::class, 'restore'])
        ->middleware('permission:tipos_eventos_sanitarios.restore');

    Route::get('tipos-eventos-sanitarios', [TipoEventoSanitarioController::class, 'index'])
        ->middleware('permission:tipos_eventos_sanitarios.view');

    Route::post('tipos-eventos-sanitarios', [TipoEventoSanitarioController::class, 'store'])
        ->middleware('permission:tipos_eventos_sanitarios.create');

    Route::get('tipos-eventos-sanitarios/{tipo_evento_sanitario}', [TipoEventoSanitarioController::class, 'show'])
        ->middleware('permission:tipos_eventos_sanitarios.view');

    Route::put('tipos-eventos-sanitarios/{tipo_evento_sanitario}', [TipoEventoSanitarioController::class, 'update'])
        ->middleware('permission:tipos_eventos_sanitarios.update');

    Route::patch('tipos-eventos-sanitarios/{tipo_evento_sanitario}', [TipoEventoSanitarioController::class, 'update'])
        ->middleware('permission:tipos_eventos_sanitarios.update');

    Route::delete('tipos-eventos-sanitarios/{tipo_evento_sanitario}', [TipoEventoSanitarioController::class, 'destroy'])
        ->middleware('permission:tipos_eventos_sanitarios.delete');

    Route::patch('tipos-eventos-sanitarios/{tipo_evento_sanitario}/estado', [TipoEventoSanitarioController::class, 'changeStatus'])
        ->middleware('permission:tipos_eventos_sanitarios.activate');
});

/*
|--------------------------------------------------------------------------
| TIPOS DE MOVIMIENTOS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('tipos-movimientos/eliminados', [TipoMovimientoController::class, 'deleted'])
        ->middleware('permission:tipos_movimientos.view');

    Route::post('tipos-movimientos/{id}/restaurar', [TipoMovimientoController::class, 'restore'])
        ->middleware('permission:tipos_movimientos.restore');

    Route::get('tipos-movimientos', [TipoMovimientoController::class, 'index'])
        ->middleware('permission:tipos_movimientos.view');

    Route::post('tipos-movimientos', [TipoMovimientoController::class, 'store'])
        ->middleware('permission:tipos_movimientos.create');

    Route::get('tipos-movimientos/{tipo_movimiento}', [TipoMovimientoController::class, 'show'])
        ->middleware('permission:tipos_movimientos.view');

    Route::put('tipos-movimientos/{tipo_movimiento}', [TipoMovimientoController::class, 'update'])
        ->middleware('permission:tipos_movimientos.update');

    Route::patch('tipos-movimientos/{tipo_movimiento}', [TipoMovimientoController::class, 'update'])
        ->middleware('permission:tipos_movimientos.update');

    Route::delete('tipos-movimientos/{tipo_movimiento}', [TipoMovimientoController::class, 'destroy'])
        ->middleware('permission:tipos_movimientos.delete');

    Route::patch('tipos-movimientos/{tipo_movimiento}/estado', [TipoMovimientoController::class, 'changeStatus'])
        ->middleware('permission:tipos_movimientos.activate');
});

/*
|--------------------------------------------------------------------------
| TIPOS DE ALERTAS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('tipos-alertas/eliminados', [TipoAlertaController::class, 'deleted'])
        ->middleware('permission:tipos_alertas.view');

    Route::post('tipos-alertas/{id}/restaurar', [TipoAlertaController::class, 'restore'])
        ->middleware('permission:tipos_alertas.restore');

    Route::get('tipos-alertas', [TipoAlertaController::class, 'index'])
        ->middleware('permission:tipos_alertas.view');

    Route::post('tipos-alertas', [TipoAlertaController::class, 'store'])
        ->middleware('permission:tipos_alertas.create');

    Route::get('tipos-alertas/{tipo_alerta}', [TipoAlertaController::class, 'show'])
        ->middleware('permission:tipos_alertas.view');

    Route::put('tipos-alertas/{tipo_alerta}', [TipoAlertaController::class, 'update'])
        ->middleware('permission:tipos_alertas.update');

    Route::patch('tipos-alertas/{tipo_alerta}', [TipoAlertaController::class, 'update'])
        ->middleware('permission:tipos_alertas.update');

    Route::delete('tipos-alertas/{tipo_alerta}', [TipoAlertaController::class, 'destroy'])
        ->middleware('permission:tipos_alertas.delete');

    Route::patch('tipos-alertas/{tipo_alerta}/estado', [TipoAlertaController::class, 'changeStatus'])
        ->middleware('permission:tipos_alertas.activate');
});

/*
|--------------------------------------------------------------------------
| ESTABLECIMIENTOS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('establecimientos/eliminados', [EstablecimientoController::class, 'deleted'])
        ->middleware('permission:establecimientos.view');

    Route::post('establecimientos/{id}/restaurar', [EstablecimientoController::class, 'restore'])
        ->middleware('permission:establecimientos.restore');

    Route::get('establecimientos', [EstablecimientoController::class, 'index'])
        ->middleware('permission:establecimientos.view');

    Route::post('establecimientos', [EstablecimientoController::class, 'store'])
        ->middleware('permission:establecimientos.create');

    Route::get('establecimientos/{establecimiento}', [EstablecimientoController::class, 'show'])
        ->middleware('permission:establecimientos.view');

    Route::put('establecimientos/{establecimiento}', [EstablecimientoController::class, 'update'])
        ->middleware('permission:establecimientos.update');

    Route::patch('establecimientos/{establecimiento}', [EstablecimientoController::class, 'update'])
        ->middleware('permission:establecimientos.update');

    Route::delete('establecimientos/{establecimiento}', [EstablecimientoController::class, 'destroy'])
        ->middleware('permission:establecimientos.delete');

    Route::patch('establecimientos/{establecimiento}/estado', [EstablecimientoController::class, 'changeStatus'])
        ->middleware('permission:establecimientos.activate');
});

/*
|--------------------------------------------------------------------------
| POTREROS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('potreros/eliminados', [PotreroController::class, 'deleted'])
        ->middleware('permission:potreros.view');

    Route::post('potreros/{id}/restaurar', [PotreroController::class, 'restore'])
        ->middleware('permission:potreros.restore');

    Route::get('potreros', [PotreroController::class, 'index'])
        ->middleware('permission:potreros.view');

    Route::post('potreros', [PotreroController::class, 'store'])
        ->middleware('permission:potreros.create');

    Route::get('potreros/{potrero}', [PotreroController::class, 'show'])
        ->middleware('permission:potreros.view');

    Route::put('potreros/{potrero}', [PotreroController::class, 'update'])
        ->middleware('permission:potreros.update');

    Route::patch('potreros/{potrero}', [PotreroController::class, 'update'])
        ->middleware('permission:potreros.update');

    Route::delete('potreros/{potrero}', [PotreroController::class, 'destroy'])
        ->middleware('permission:potreros.delete');

    Route::patch('potreros/{potrero}/estado', [PotreroController::class, 'changeStatus'])
        ->middleware('permission:potreros.activate');
});
