<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Raza;
use App\Models\CategoriaAnimal;
use App\Models\Vacuna;
use App\Models\EstadoProductivo;
use App\Models\TipoEventoSanitario;
use App\Models\TipoMovimiento;
use App\Models\TipoAlerta;
use App\Models\Establecimiento;
use App\Models\Potrero;
use App\Policies\UserPolicy;
use App\Policies\RazaPolicy;
use App\Policies\CategoriaAnimalPolicy;
use App\Policies\VacunaPolicy;
use App\Policies\EstadoProductivoPolicy;
use App\Policies\TipoEventoSanitarioPolicy;
use App\Policies\TipoMovimientoPolicy;
use App\Policies\TipoAlertaPolicy;
use App\Policies\EstablecimientoPolicy;
use App\Policies\PotreroPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Raza::class, RazaPolicy::class);
        Gate::policy(CategoriaAnimal::class, CategoriaAnimalPolicy::class);
        Gate::policy(Vacuna::class, VacunaPolicy::class);
        Gate::policy(EstadoProductivo::class, EstadoProductivoPolicy::class);
        Gate::policy(TipoEventoSanitario::class, TipoEventoSanitarioPolicy::class);
        Gate::policy(TipoMovimiento::class, TipoMovimientoPolicy::class);
        Gate::policy(TipoAlerta::class, TipoAlertaPolicy::class);
        Gate::policy(Establecimiento::class, EstablecimientoPolicy::class);
        Gate::policy(Potrero::class, PotreroPolicy::class);

        Route::bind('categoria', fn (string $value) => CategoriaAnimal::query()->findOrFail($value));
        Route::bind('vacuna', fn (string $value) => Vacuna::query()->findOrFail($value));
        Route::bind('estado_productivo', fn (string $value) => EstadoProductivo::query()->findOrFail($value));
        Route::bind('tipo_evento_sanitario', fn (string $value) => TipoEventoSanitario::query()->findOrFail($value));
        Route::bind('tipo_movimiento', fn (string $value) => TipoMovimiento::query()->findOrFail($value));
        Route::bind('tipo_alerta', fn (string $value) => TipoAlerta::query()->findOrFail($value));
        Route::bind('establecimiento', fn (string $value) => Establecimiento::query()->findOrFail($value));
        Route::bind('potrero', fn (string $value) => Potrero::query()->findOrFail($value));

        Gate::before(function (User $user, string $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });
    }
}
