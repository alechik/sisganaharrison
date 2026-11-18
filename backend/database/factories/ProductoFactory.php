<?php

namespace Database\Factories;

use App\Models\Producto;
use App\Models\Presentacion;
use App\Models\SubcategoriaProducto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Producto>
 */
class ProductoFactory extends Factory
{
    protected $model = Producto::class;

    public function definition(): array
    {
        return [
            'presentacion_id' => Presentacion::query()->value('id') ?? Presentacion::factory(),
            'subcategoria_producto_id' => SubcategoriaProducto::query()->value('id') ?? SubcategoriaProducto::factory(),
            'codigo' => strtoupper(fake()->unique()->bothify('PRD_##??')),
            'nombre' => fake()->words(3, true),
            'nombre_cientifico' => fake()->optional()->words(2, true),
            'precio' => fake()->randomFloat(2, 5, 250),
            'descripcion' => fake()->sentence(),
            'activo' => true,
        ];
    }
}
