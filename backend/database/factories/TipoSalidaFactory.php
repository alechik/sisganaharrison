<?php

namespace Database\Factories;

use App\Models\TipoSalida;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TipoSalida>
 */
class TipoSalidaFactory extends Factory
{
    protected $model = TipoSalida::class;

    public function definition(): array
    {
        return [
            'nombre' => Str::title(fake()->unique()->words(2, true)),
        ];
    }
}
