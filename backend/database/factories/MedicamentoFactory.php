<?php

namespace Database\Factories;

use App\Models\Medicamento;
use App\Models\Presentacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medicamento>
 */
class MedicamentoFactory extends Factory
{
    protected $model = Medicamento::class;

    public function definition(): array
    {
        return [
            'presentacion_id' => Presentacion::query()->value('id') ?? Presentacion::factory(),
            'codigo' => strtoupper(fake()->unique()->bothify('MED_##??')),
            'nombre' => fake()->words(3, true),
            'laboratorio' => fake()->optional()->company(),
            'precio' => fake()->randomFloat(2, 5, 250),
            'descripcion' => fake()->sentence(),
            'activo' => true,
        ];
    }
}
