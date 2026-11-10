<?php

namespace Database\Factories;

use App\Models\TipoIngreso;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TipoIngreso>
 */
class TipoIngresoFactory extends Factory
{
    protected $model = TipoIngreso::class;

    public function definition(): array
    {
        $token = strtoupper(fake()->unique()->lexify('??'));

        return [
            'nombre' => 'Tipo '.$token,
            'codigo' => 'T'.$token.fake()->unique()->numerify('##'),
            'iniciales' => $token.fake()->unique()->numerify('#'),
            'descripcion' => fake()->optional()->sentence(),
            'requiere_proveedor' => false,
            'estado' => true,
        ];
    }
}
