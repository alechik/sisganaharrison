<?php

namespace Database\Factories;

use App\Models\Gestacion;
use App\Models\Parto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Parto>
 */
class PartoFactory extends Factory
{
    protected $model = Parto::class;

    public function definition(): array
    {
        return [
            'gestacion_id' => Gestacion::factory(),
            'fecha_parto' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'observaciones' => fake()->optional()->sentence(),
        ];
    }
}
