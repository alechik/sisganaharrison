<?php

namespace Database\Factories;

use App\Models\TipoSalida;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TipoSalida>
 */
class TipoSalidaFactory extends Factory
{
    protected $model = TipoSalida::class;

    public function definition(): array
    {
        $nombre = Str::title(fake()->unique()->words(2, true));
        $codigo = strtoupper(Str::slug($nombre, '_')).'_'.strtoupper(Str::random(4));

        return [
            'nombre' => $nombre,
            'codigo' => $codigo,
            'iniciales' => strtoupper(Str::random(2)),
            'descripcion' => null,
            'requiere_cliente' => false,
            'estado' => true,
        ];
    }
}
