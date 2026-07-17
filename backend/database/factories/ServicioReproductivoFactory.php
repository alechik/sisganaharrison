<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\ServicioReproductivo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServicioReproductivo>
 */
class ServicioReproductivoFactory extends Factory
{
    protected $model = ServicioReproductivo::class;

    public function definition(): array
    {
        return [
            'hembra_id' => Animal::factory()->state(['sexo' => 'H']),
            'macho_id' => Animal::factory()->state(['sexo' => 'M']),
            'fecha_servicio' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'tipo_servicio' => fake()->randomElement(ServicioReproductivo::TIPOS_SERVICIO),
            'resultado' => fake()->optional()->randomElement(ServicioReproductivo::RESULTADOS),
            'observaciones' => fake()->optional()->sentence(),
        ];
    }

    public function sinMacho(): static
    {
        return $this->state(fn (array $attributes) => [
            'macho_id' => null,
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
        ]);
    }
}
