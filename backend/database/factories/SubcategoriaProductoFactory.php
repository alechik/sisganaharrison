<?php

namespace Database\Factories;

use App\Models\CategoriaProducto;
use App\Models\SubcategoriaProducto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubcategoriaProducto>
 */
class SubcategoriaProductoFactory extends Factory
{
    protected $model = SubcategoriaProducto::class;

    public function definition(): array
    {
        return [
            'categoria_producto_id' => CategoriaProducto::query()->value('id') ?? CategoriaProducto::factory(),
            'nombre' => 'SUB-'.strtoupper(substr(uniqid(), -8)),
            'activo' => true,
        ];
    }
}
