<?php

namespace Database\Factories;

use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use App\Models\Venta;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Venta>
 */
class VentaFactory extends Factory
{
    protected $model = Venta::class;

    public function definition(): array
    {
        return [
            'cliente_id' => Persona::query()
                ->whereHas('tipos', fn ($query) => $query->where('tipo.nombre', TipoPersona::CLIENTE))
                ->value('id') ?? Persona::factory(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'cod_venta' => 'VEN-'.now()->year.'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'fecha_venta' => fake()->date(),
            'estado' => Venta::ESTADO_PENDIENTE,
            'descuento' => 0,
            'total_peso' => null,
            'monto_total' => 0,
        ];
    }
}
