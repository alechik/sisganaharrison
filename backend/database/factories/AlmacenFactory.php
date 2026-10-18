<?php

namespace Database\Factories;

use App\Models\Almacen;
use App\Models\Establecimiento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Almacen>
 */
class AlmacenFactory extends Factory
{
    protected $model = Almacen::class;

    public function definition(): array
    {
        $establecimiento = Establecimiento::query()->first() ?? Establecimiento::factory()->create();

        return [
            'establecimiento_id' => $establecimiento->id,
            'nombre' => 'Almacén '.$establecimiento->nombre,
            'direccion' => $establecimiento->direccion,
            'observacion' => null,
            'activo' => true,
        ];
    }
}
