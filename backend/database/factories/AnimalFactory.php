<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\EstadoProductivo;
use App\Models\Lote;
use App\Models\Raza;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Animal>
 */
class AnimalFactory extends Factory
{
    protected $model = Animal::class;

    public function definition(): array
    {
        $codigo = Str::upper(fake()->unique()->bothify('AN-####'));

        return [
            'codigo' => $codigo,
            'arete' => Str::upper(fake()->unique()->bothify('AR-####')),
            'nombre' => fake()->optional()->firstName(),
            'sexo' => fake()->randomElement(['M', 'H']),
            'fecha_nacimiento' => fake()->optional()->dateTimeBetween('-5 years', '-3 months')?->format('Y-m-d'),
            'raza_id' => Raza::factory(),
            'categoria_id' => CategoriaAnimal::factory(),
            'estado_productivo_id' => EstadoProductivo::factory(),
            'lote_id' => Lote::factory(),
            'madre_id' => null,
            'padre_id' => null,
            'color' => fake()->optional()->randomElement(['Negro', 'Colorado', 'Blanco', 'Overo']),
            'observaciones' => fake()->optional()->sentence(),
            'user_id' => User::query()->value('id') ?? User::factory(),
            'edad_inicial' => null,
            'edad_actual' => null,
            'precio_kilo' => null,
            'estado' => Animal::ESTADO_ACTIVO,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => Animal::ESTADO_OTRO,
        ]);
    }

    public function preliminar(): static
    {
        return $this->state(fn (array $attributes) => [
            'arete' => null,
            'nombre' => null,
            'fecha_nacimiento' => null,
            'raza_id' => null,
            'estado_productivo_id' => null,
            'lote_id' => null,
            'madre_id' => null,
            'padre_id' => null,
            'color' => null,
            'observaciones' => null,
        ]);
    }
}
