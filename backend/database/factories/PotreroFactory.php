<?php

namespace Database\Factories;

use App\Models\Establecimiento;
use App\Models\Potrero;
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
            'establecimiento_id' => Establecimiento::factory(),
            'codigo' => Str::upper(Str::slug($nombre, '_')),
            'nombre' => Str::title($nombre),
            'area_ha' => fake()->optional()->randomFloat(2, 10, 500),
            'tipo_pasto' => fake()->optional()->randomElement(['Brachiaria', 'Gamba', 'Natural', 'Mezclado']),
            'disponibilidad' => true,
            'descripcion' => fake()->optional()->sentence(),
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
