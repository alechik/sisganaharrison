<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Raza;
use App\Models\CategoriaAnimal;
use App\Models\Vacuna;
use App\Policies\UserPolicy;
use App\Policies\RazaPolicy;
use App\Policies\CategoriaAnimalPolicy;
use App\Policies\VacunaPolicy;
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

        Route::bind('categoria', fn (string $value) => CategoriaAnimal::query()->findOrFail($value));
        Route::bind('vacuna', fn (string $value) => Vacuna::query()->findOrFail($value));

        Gate::before(function (User $user, string $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });
    }
}
