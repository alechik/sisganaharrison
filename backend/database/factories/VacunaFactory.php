<?php

namespace Database\Factories;

use App\Models\Vacuna;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Vacuna>
 */
class VacunaFactory extends Factory
{
    protected $model = Vacuna::class;

    public function definition(): array
    {
        $nombre = fake()->unique()->words(2, true);

        return [
            'codigo' => Str::upper(Str::slug($nombre, '_')),
            'nombre' => Str::title($nombre),
            'laboratorio' => fake()->optional()->company(),
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
