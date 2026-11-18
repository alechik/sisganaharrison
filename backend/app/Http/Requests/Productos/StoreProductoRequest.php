<?php

namespace App\Http\Requests\Productos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('productos.create') ?? false;
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
        return [
            'presentacion_id' => 'required|integer|exists:presentaciones,id',
            'subcategoria_producto_id' => 'required|integer|exists:subcategorias_productos,id',
            'codigo' => 'required|string|max:20|unique:productos,codigo|regex:/^[A-Z0-9_]+$/',
            'nombre' => 'required|string|max:100',
            'nombre_cientifico' => 'nullable|string|max:120',
            'precio' => 'required|numeric|min:0|max:999999.99',
            'descripcion' => 'required|string|max:2000',
            'activo' => 'sometimes|boolean',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'presentacion_id.required' => 'Debe seleccionar una presentación.',
            'presentacion_id.exists' => 'La presentación seleccionada no existe.',
            'subcategoria_producto_id.required' => 'Debe seleccionar una subcategoría.',
            'codigo.unique' => 'Ya existe un producto con este código.',
            'nombre.required' => 'El nombre es obligatorio.',
            'precio.required' => 'El precio es obligatorio.',
            'descripcion.required' => 'La descripción es obligatoria.',
        ];
    }
}
