<?php

namespace App\Http\Requests\Ventas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVentaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('ventas.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cliente_id' => 'required|integer|exists:personas,id',
            'fecha_venta' => 'required|date|before_or_equal:today',
            'descuento' => 'nullable|numeric|min:0|max:999999.99',
            'detalles' => 'required|array|min:1',
            'detalles.*.animal_id' => 'required|integer|distinct|exists:animales,id',
            'detalles.*.peso' => 'required|numeric|min:0.01|max:999999.99',
            'detalles.*.precio' => 'required|numeric|min:0|max:999999.99',
            'detalles.*.descuento' => 'nullable|numeric|min:0|max:999999.99',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cliente_id.required' => 'Debe seleccionar un cliente.',
            'detalles.required' => 'Debe agregar al menos un animal.',
            'detalles.*.animal_id.distinct' => 'El mismo animal no puede repetirse en la venta.',
            'detalles.*.peso.min' => 'El peso debe ser mayor a cero.',
        ];
    }
}
