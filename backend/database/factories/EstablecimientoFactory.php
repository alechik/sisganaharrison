<?php

namespace Database\Factories;

use App\Models\Establecimiento;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Establecimiento>
 */
class EstablecimientoFactory extends Factory
{
    protected $model = Establecimiento::class;

    public function definition(): array
    {
        $nombre = fake()->unique()->company();

        return [
            'codigo' => Str::upper(Str::slug($nombre, '_')),
            'nombre' => $nombre,
            'propietario' => fake()->name(),
            'telefono' => fake()->optional()->numerify('+591 #######'),
            'direccion' => fake()->optional()->streetAddress(),
            'municipio' => fake()->optional()->city(),
            'departamento' => fake()->optional()->state(),
            'pais' => 'Bolivia',
            'area_total_ha' => fake()->optional()->randomFloat(2, 50, 5000),
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
