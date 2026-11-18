<?php

namespace Database\Factories;

use App\Models\Grupo;
use App\Models\Potrero;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Grupo>
 */
class GrupoFactory extends Factory
{
    protected $model = Grupo::class;

    public function definition(): array
    {
        return [
            'potrero_id' => Potrero::query()->value('id') ?? Potrero::factory(),
            'nombre' => 'GRP-'.strtoupper(substr(uniqid(), -6)),
            'observaciones' => fake()->optional()->sentence(),
            'activo' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => false,
        ]);
    }
}
