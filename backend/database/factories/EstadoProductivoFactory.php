<?php

namespace Database\Factories;

use App\Models\EstadoProductivo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<EstadoProductivo>
 */
class EstadoProductivoFactory extends Factory
{
    protected $model = EstadoProductivo::class;

    public function definition(): array
    {
        $nombre = fake()->unique()->words(2, true);

        return [
            'codigo' => Str::upper(Str::slug($nombre, '_')),
            'nombre' => Str::title($nombre),
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
