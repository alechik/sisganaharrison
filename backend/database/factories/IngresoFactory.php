<?php

namespace Database\Factories;

use App\Models\Ingreso;
use App\Models\Potrero;
use App\Models\Persona;
use App\Models\TipoIngreso;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ingreso>
 */
class IngresoFactory extends Factory
{
    protected $model = Ingreso::class;

    public function definition(): array
    {
        return [
            'codigo' => 'INCO'.str_pad((string) fake()->unique()->numberBetween(1, 999999), 6, '0', STR_PAD_LEFT),
            'tipo_ingreso_id' => TipoIngreso::query()->where('codigo', TipoIngreso::CODIGO_COMPRA)->value('id')
                ?? TipoIngreso::factory()->create(['codigo' => 'COMPRA', 'iniciales' => 'CO', 'requiere_proveedor' => true])->id,
            'proveedor_id' => Persona::query()
                ->whereHas('tipos', fn ($query) => $query->where('tipo.nombre', TipoPersona::PROVEEDOR))
                ->value('id') ?? Persona::factory(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'cuarentena_id' => null,
            'potrero_id' => Potrero::query()->value('id') ?? Potrero::factory(),
            'fecha_ingreso' => now()->toDateString(),
            'estado' => Ingreso::ESTADO_REGISTRADO,
            'observaciones' => null,
            'descuento' => 0,
            'total_peso' => 0,
            'monto_total' => 0,
        ];
    }
}
