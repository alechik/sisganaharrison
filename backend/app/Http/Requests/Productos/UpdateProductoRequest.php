<?php

namespace App\Http\Requests\Productos;

use App\Models\Producto;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('productos.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('codigo')) {
            $this->merge([
                'codigo' => Str::upper(Str::slug((string) $this->input('codigo'), '_')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Producto|null $producto */
        $producto = $this->route('producto');

        return [
            'presentacion_id' => 'required|integer|exists:presentaciones,id',
            'subcategoria_producto_id' => 'required|integer|exists:subcategorias_productos,id',
            'codigo' => [
                'required',
                'string',
                'max:20',
                'regex:/^[A-Z0-9_]+$/',
                Rule::unique('productos', 'codigo')->ignore($producto?->id),
            ],
            'nombre' => 'required|string|max:100',
            'nombre_cientifico' => 'nullable|string|max:120',
            'precio' => 'required|numeric|min:0|max:999999.99',
            'descripcion' => 'required|string|max:2000',
            'activo' => 'sometimes|boolean',
        ];
    }
}
