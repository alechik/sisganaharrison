<?php

namespace Database\Factories;

use App\Models\Pesaje;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pesaje>
 */
class PesajeFactory extends Factory
{
    protected $model = Pesaje::class;

    public function definition(): array
    {
        $peso = fake()->randomFloat(2, 50, 900);

        return [
            'codigo_pesaje' => 'PES-'.now()->year.'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'fecha_pesaje' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'total_peso' => $peso,
            'observacion' => fake()->optional()->sentence(),
            'user_id' => User::query()->value('id') ?? User::factory(),
        ];
    }
}
