<?php

namespace App\Http\Requests\Compras;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrdenCompraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'proveedor_id' => 'required|integer|exists:personas,id',
            'fecha' => 'required|date',
            'descuento' => 'nullable|numeric|min:0',
            'total_peso' => 'nullable|numeric|min:0',
            'detalles' => 'required|array|min:1',
            'detalles.*.categoria_animal_id' => 'required|integer|exists:categorias_animales,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio' => 'required|numeric|min:0',
            'detalles.*.descuento' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'proveedor_id.required' => 'Debe seleccionar un proveedor.',
            'detalles.required' => 'Debe agregar al menos un detalle.',
            'detalles.*.categoria_animal_id.required' => 'Cada línea debe tener una categoría.',
            'detalles.*.cantidad.min' => 'La cantidad debe ser mayor a cero.',
        ];
    }
}
