<?php

namespace Database\Factories;

use App\Models\Cuarentena;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cuarentena>
 */
class CuarentenaFactory extends Factory
{
    protected $model = Cuarentena::class;

    public function definition(): array
    {
        return [
            'proveedor_id' => Persona::query()
                ->whereHas('tipos', fn ($query) => $query->where('tipo.nombre', TipoPersona::PROVEEDOR))
                ->value('id') ?? Persona::factory(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'orden_compra_id' => null,
            'cod_compra' => 'CQ-'.now()->year.'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'origen' => Cuarentena::ORIGEN_DIRECTA,
            'fecha_inicio' => fake()->date(),
            'fecha_fin' => null,
            'estado' => Cuarentena::ESTADO_PROCESADO,
            'descuento' => 0,
            'total_peso' => 0,
            'monto_total' => 0,
        ];
    }

    public function completada(): static
    {
        return $this->state(fn () => [
            'estado' => Cuarentena::ESTADO_COMPLETADO,
            'fecha_fin' => now()->toDateString(),
        ]);
    }
}
