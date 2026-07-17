<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\EventoSanitario;
use App\Models\TipoEventoSanitario;
use App\Models\Vacuna;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventoSanitario>
 */
class EventoSanitarioFactory extends Factory
{
    protected $model = EventoSanitario::class;

    public function definition(): array
    {
        return [
            'animal_id' => Animal::factory(),
            'tipo_evento_id' => TipoEventoSanitario::factory(),
            'vacuna_id' => null,
            'fecha' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'diagnostico' => fake()->optional()->sentence(),
            'tratamiento' => fake()->optional()->sentence(),
            'observaciones' => fake()->optional()->sentence(),
        ];
    }

    public function vacunacion(): static
    {
        return $this->state(fn (array $attributes) => [
            'vacuna_id' => Vacuna::factory(),
        ]);
    }
}
