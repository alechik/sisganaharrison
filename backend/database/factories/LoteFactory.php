<?php

namespace Database\Factories;

use App\Models\Lote;
use App\Models\Potrero;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Lote>
 */
class LoteFactory extends Factory
{
    protected $model = Lote::class;

    public function definition(): array
    {
        $nombre = fake()->unique()->words(2, true);

        return [
            'potrero_id' => Potrero::factory(),
            'codigo' => Str::upper(Str::slug($nombre, '_')),
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
