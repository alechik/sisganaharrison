<?php

namespace Database\Factories;

use App\Models\Raza;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Raza>
 */
class RazaFactory extends Factory
{
    protected $model = Raza::class;

    public function definition(): array
    {
        $nombre = fake()->unique()->words(2, true);

        return [
            'nombre' => Str::title($nombre),
            'codigo' => Str::upper(Str::slug($nombre, '_')),
            'descripcion' => fake()->optional()->sentence(),
            'estado' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => false,
        ]);
    }
}
