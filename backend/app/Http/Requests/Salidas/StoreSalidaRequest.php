<?php

namespace App\Http\Requests\Salidas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSalidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('salidas.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tipo_salida_id' => 'required|integer|exists:tipos_salidas,id',
            'fecha_salida' => 'required|date|before_or_equal:today',
            'cliente_id' => 'nullable|integer|exists:personas,id',
            'venta_id' => 'nullable|integer|exists:ventas,id',
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
            'tipo_salida_id.required' => 'Debe seleccionar un tipo de salida.',
            'detalles.required' => 'Debe agregar al menos un animal.',
            'detalles.*.animal_id.distinct' => 'El mismo animal no puede repetirse en la salida.',
        ];
    }
}
