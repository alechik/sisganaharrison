<?php

namespace Database\Factories;

use App\Models\OrdenCompra;
use App\Models\Persona;
use App\Models\TipoPersona;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrdenCompra>
 */
class OrdenCompraFactory extends Factory
{
    protected $model = OrdenCompra::class;

    public function definition(): array
    {
        return [
            'proveedor_id' => Persona::query()
                ->whereHas('tipos', fn ($query) => $query->where('tipo.nombre', TipoPersona::PROVEEDOR))
                ->value('id') ?? Persona::factory(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'cod_compra' => 'OC-'.now()->year.'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'fecha' => fake()->date(),
            'estado' => OrdenCompra::ESTADO_PENDIENTE,
            'descuento' => 0,
            'total_peso' => null,
            'monto_total' => 0,
        ];
    }

    public function autorizada(): static
    {
        return $this->state(fn () => [
            'estado' => OrdenCompra::ESTADO_AUTORIZADA,
            'autorizado_por' => User::query()->value('id'),
            'fecha_decision' => now(),
        ]);
    }
}
