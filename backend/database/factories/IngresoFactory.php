<?php

namespace Database\Factories;

use App\Models\Cuarentena;
use App\Models\Ingreso;
use App\Models\Lote;
use App\Models\Persona;
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
            'codigo' => 'ING-'.now()->year.'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'proveedor_id' => Persona::query()
                ->whereHas('tipos', fn ($query) => $query->where('tipo.nombre', TipoPersona::PROVEEDOR))
                ->value('id') ?? Persona::factory(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'cuarentena_id' => Cuarentena::query()->value('id') ?? Cuarentena::factory()->completada(),
            'lote_id' => Lote::query()->value('id') ?? Lote::factory(),
            'fecha_ingreso' => now()->toDateString(),
            'estado' => Ingreso::ESTADO_REGISTRADO,
            'observaciones' => null,
            'descuento' => 0,
            'total_peso' => 0,
            'monto_total' => 0,
        ];
    }
}
