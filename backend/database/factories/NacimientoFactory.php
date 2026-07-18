<?php

namespace Database\Factories;

use App\Models\Nacimiento;
use App\Models\Parto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Nacimiento>
 */
class NacimientoFactory extends Factory
{
    protected $model = Nacimiento::class;

    public function definition(): array
    {
        $estado = fake()->randomElement(Nacimiento::ESTADOS);
        $esMuerto = $estado === Nacimiento::ESTADO_MUERTO;

        return [
            'parto_id' => Parto::factory(),
            'animal_id' => null,
            'arete' => fake()->optional()->bothify('AR-####'),
            'sexo' => fake()->randomElement(Nacimiento::SEXOS),
            'peso_nacimiento' => fake()->optional()->randomFloat(2, 15, 45),
            'estado_nacimiento' => $estado,
            'causa_muerte' => $esMuerto ? fake()->sentence(3) : null,
            'observaciones' => fake()->optional()->sentence(),
            'registrado_por' => null,
        ];
    }

    public function vivo(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado_nacimiento' => Nacimiento::ESTADO_VIVO,
            'causa_muerte' => null,
        ]);
    }

    public function muerto(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado_nacimiento' => Nacimiento::ESTADO_MUERTO,
            'animal_id' => null,
            'causa_muerte' => fake()->sentence(3),
        ]);
    }
}
