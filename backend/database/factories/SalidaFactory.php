<?php

namespace Database\Factories;

use App\Models\Persona;
use App\Models\Salida;
use App\Models\TipoSalida;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Salida>
 */
class SalidaFactory extends Factory
{
    protected $model = Salida::class;

    public function definition(): array
    {
        return [
            'cliente_id' => Persona::query()->value('id') ?? Persona::factory(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'venta_id' => null,
            'tipo_salida_id' => TipoSalida::query()->value('id') ?? TipoSalida::factory(),
            'codigo' => 'SAL-'.now()->year.'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'fecha_salida' => fake()->date(),
            'estado' => Salida::ESTADO_REGISTRADO,
            'descuento' => 0,
            'total_peso' => null,
            'monto_total' => 0,
        ];
    }
}
