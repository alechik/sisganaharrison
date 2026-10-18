<?php

namespace App\Http\Requests\CategoriasProductos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoriaProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('categorias_productos.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('categorias_productos', 'nombre')->whereNull('deleted_at'),
            ],
        ];
    }
}
