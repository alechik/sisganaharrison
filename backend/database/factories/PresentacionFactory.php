<?php

namespace Database\Factories;

use App\Models\Presentacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Presentacion>
 */
class PresentacionFactory extends Factory
{
    protected $model = Presentacion::class;

    public function definition(): array
    {
        return [
            'descripcion' => fake()->unique()->words(2, true),
        ];
    }
}
