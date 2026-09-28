<?php

namespace Database\Factories;

use App\Models\Lote;
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
        $loteSalida = Lote::query()->value('id') ?? Lote::factory();
        $loteIngreso = Lote::query()->where('id', '!=', is_numeric($loteSalida) ? $loteSalida : 0)->value('id')
            ?? Lote::factory();

        return [
            'user_id' => User::query()->value('id') ?? User::factory(),
            'lote_salida_id' => $loteSalida,
            'lote_ingreso_id' => $loteIngreso,
            'fecha_traspaso' => fake()->date(),
            'observacion' => fake()->optional()->sentence(),
            'total_peso' => 0,
            'monto_total' => 0,
        ];
    }
}
