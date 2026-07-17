<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\Pesaje;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pesaje>
 */
class PesajeFactory extends Factory
{
    protected $model = Pesaje::class;

    public function definition(): array
    {
        return [
            'animal_id' => Animal::factory(),
            'fecha' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'peso' => fake()->randomFloat(2, 50, 900),
            'observaciones' => fake()->optional()->sentence(),
        ];
    }
}
