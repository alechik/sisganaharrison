<?php

namespace Database\Factories;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Persona>
 */
class PersonaFactory extends Factory
{
    protected $model = Persona::class;

    public function definition(): array
    {
        return [
            'razon_social' => fake()->unique()->company(),
            'responsable' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'fecha_nacimiento' => fake()->optional()->date(),
            'ci' => fake()->optional()->numberBetween(1000000, 9999999),
            'nit' => fake()->optional()->numerify('########-#'),
            'celular' => fake()->optional()->numberBetween(900000000, 999999999),
            'estado_civil' => fake()->optional()->randomElement(Persona::ESTADOS_CIVILES),
            'sexo' => fake()->optional()->randomElement(Persona::SEXOS),
            'direccion' => fake()->optional()->streetAddress(),
            'estado' => Persona::ESTADO_ACTIVO,
            'fecha_reg' => now()->toDateString(),
            'user_id' => User::query()->value('id') ?? User::factory(),
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => Persona::ESTADO_INACTIVO,
        ]);
    }
}
