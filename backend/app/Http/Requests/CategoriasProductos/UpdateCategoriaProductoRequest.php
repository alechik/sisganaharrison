<?php

namespace App\Http\Requests\CategoriasProductos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoriaProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('categorias_productos.update') ?? false;
    }

    public function rules(): array
    {
        $categoria = $this->route('categoria_producto');

        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('categorias_productos', 'nombre')->ignore($categoria?->id)->whereNull('deleted_at'),
            ],
        ];
    }
}
