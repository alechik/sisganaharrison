<?php

namespace Database\Factories;

use App\Models\Estancia;
use App\Models\Parcela;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Parcela>
 */
class ParcelaFactory extends Factory
{
    protected $model = Parcela::class;

    public function definition(): array
    {
        $nombre = fake()->unique()->words(2, true);

        return [
            'estancia_id' => Estancia::factory(),
            'codigo' => 'PAR_'.strtoupper(Str::random(8)),
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
