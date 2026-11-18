<?php

namespace Database\Factories;

use App\Models\Potrero;
use App\Models\Parcela;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Potrero>
 */
class PotreroFactory extends Factory
{
    protected $model = Potrero::class;

    public function definition(): array
    {
        $nombre = fake()->unique()->words(2, true);

        return [
            'parcela_id' => Parcela::factory(),
            'codigo' => 'POT_'.strtoupper(Str::random(8)),
            'nombre' => Str::title($nombre),
            'capacidad_animales' => fake()->numberBetween(20, 200),
            'area_ha' => fake()->optional()->randomFloat(2, 5, 100),
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
