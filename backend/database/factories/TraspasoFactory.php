<?php

namespace Database\Factories;

use App\Models\Potrero;
use App\Models\Traspaso;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Traspaso>
 */
class TraspasoFactory extends Factory
{
    protected $model = Traspaso::class;

    public function definition(): array
    {
        $potreroSalida = Potrero::query()->value('id') ?? Potrero::factory();
        $potreroIngreso = Potrero::query()->where('id', '!=', is_numeric($potreroSalida) ? $potreroSalida : 0)->value('id')
            ?? Potrero::factory();

        return [
            'user_id' => User::query()->value('id') ?? User::factory(),
            'potrero_salida_id' => $potreroSalida,
            'potrero_ingreso_id' => $potreroIngreso,
            'fecha_traspaso' => fake()->date(),
            'observacion' => fake()->optional()->sentence(),
            'total_peso' => 0,
            'monto_total' => 0,
        ];
    }
}
