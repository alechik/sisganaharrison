<?php

namespace Database\Factories;

use App\Models\CategoriaProducto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CategoriaProducto>
 */
class CategoriaProductoFactory extends Factory
{
    protected $model = CategoriaProducto::class;

    public function definition(): array
    {
        return [
            'nombre' => 'CAT-'.strtoupper(substr(uniqid(), -8)),
            'activo' => true,
        ];
    }
}
