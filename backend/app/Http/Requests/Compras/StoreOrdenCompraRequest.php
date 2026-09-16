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
            'detalles' => 'required|array|min:1',
            'detalles.*.categoria_animal_id' => 'required|integer|exists:categorias_animales,id',
            'detalles.*.sexo' => 'required|string|in:M,H',
            'detalles.*.animal_id' => 'nullable|integer|exists:animales,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.peso' => 'required|numeric|min:0.01|max:999999.99',
            'detalles.*.edad' => 'required|integer|min:0|max:600',
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
            'detalles.*.sexo.required' => 'Cada animal debe tener sexo.',
            'detalles.*.sexo.in' => 'El sexo debe ser M (macho) o H (hembra).',
            'detalles.*.cantidad.min' => 'La cantidad debe ser mayor a cero.',
            'detalles.*.peso.required' => 'Cada línea debe registrar el peso del ejemplar.',
            'detalles.*.peso.min' => 'El peso del ejemplar debe ser mayor a cero.',
            'detalles.*.edad.required' => 'Cada animal debe tener edad inicial (meses).',
        ];
    }
}
