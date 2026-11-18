<?php

namespace Database\Factories;

use App\Models\Almacen;
use App\Models\Estancia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Almacen>
 */
class AlmacenFactory extends Factory
{
    protected $model = Almacen::class;

    public function definition(): array
    {
        $estancia = Estancia::query()->first() ?? Estancia::factory()->create();

        return [
            'estancia_id' => $estancia->id,
            'nombre' => 'Almacén '.$estancia->nombre,
            'direccion' => $estancia->direccion,
            'observacion' => null,
            'activo' => true,
        ];
    }
}
