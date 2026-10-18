<?php

namespace App\Http\Requests\SubcategoriasProductos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubcategoriaProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('subcategorias_productos.update') ?? false;
    }

    public function rules(): array
    {
        $sub = $this->route('subcategoria_producto');

        return [
            'categoria_producto_id' => [
                'required',
                'integer',
                Rule::exists('categorias_productos', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('subcategorias_productos', 'nombre')
                    ->ignore($sub?->id)
                    ->where(fn ($q) => $q->where('categoria_producto_id', $this->input('categoria_producto_id'))->whereNull('deleted_at')),
            ],
        ];
    }
}
