<?php

namespace Database\Factories;

use App\Models\Gestacion;
use App\Models\ServicioReproductivo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Gestacion>
 */
class GestacionFactory extends Factory
{
    protected $model = Gestacion::class;

    public function definition(): array
    {
        $fechaConfirmacion = fake()->dateTimeBetween('-1 year', 'now');

        return [
            'servicio_id' => ServicioReproductivo::factory(),
            'fecha_confirmacion' => $fechaConfirmacion->format('Y-m-d'),
            'fecha_probable_parto' => fake()->dateTimeBetween($fechaConfirmacion, '+10 months')->format('Y-m-d'),
            'estado' => fake()->randomElement(Gestacion::ESTADOS),
            'observaciones' => fake()->optional()->sentence(),
        ];
    }

    public function activa(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => Gestacion::ESTADO_ACTIVA,
        ]);
    }
}
