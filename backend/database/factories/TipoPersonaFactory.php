<?php

namespace Database\Factories;

use App\Models\TipoPersona;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TipoPersona>
 */
class TipoPersonaFactory extends Factory
{
    protected $model = TipoPersona::class;

    public function definition(): array
    {
        return [
            'nombre' => Str::upper(fake()->unique()->lexify('TIPO_????')),
        ];
    }
}
