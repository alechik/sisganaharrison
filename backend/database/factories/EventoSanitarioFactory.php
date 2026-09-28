<?php

namespace Database\Factories;

use App\Models\EventoSanitario;
use App\Models\TipoEventoSanitario;
use App\Models\User;
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
            'tipo_evento_id' => TipoEventoSanitario::query()->value('id') ?? TipoEventoSanitario::factory(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'fecha' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'diagnostico' => fake()->optional()->sentence(),
            'tratamiento' => fake()->optional()->sentence(),
            'total' => 0,
            'observaciones' => fake()->optional()->sentence(),
        ];
    }
}
