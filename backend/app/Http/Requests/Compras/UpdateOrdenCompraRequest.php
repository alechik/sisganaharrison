<?php

namespace App\Http\Requests\Compras;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOrdenCompraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras.update') ?? false;
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
}
