<?php

namespace App\Http\Requests\Traspasos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTraspasoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('traspasos.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'lote_salida_id' => [
                'required',
                'integer',
                'different:lote_ingreso_id',
                Rule::exists('lotes', 'id')->where('activo', true)->whereNull('deleted_at'),
            ],
            'lote_ingreso_id' => [
                'required',
                'integer',
                'different:lote_salida_id',
                Rule::exists('lotes', 'id')->where('activo', true)->whereNull('deleted_at'),
            ],
            'fecha_traspaso' => 'required|date|before_or_equal:today',
            'observacion' => 'nullable|string|max:2000',
            'detalles' => 'required|array|min:1',
            'detalles.*.animal_id' => 'required|integer|distinct|exists:animales,id',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'lote_salida_id.required' => 'Debe seleccionar el lote de salida.',
            'lote_ingreso_id.required' => 'Debe seleccionar el lote de ingreso.',
            'lote_salida_id.different' => 'El lote de salida y el de ingreso deben ser distintos.',
            'lote_ingreso_id.different' => 'El lote de salida y el de ingreso deben ser distintos.',
            'fecha_traspaso.required' => 'La fecha de traspaso es obligatoria.',
            'detalles.required' => 'Debe seleccionar al menos un animal.',
            'detalles.min' => 'Debe seleccionar al menos un animal.',
            'detalles.*.animal_id.distinct' => 'El mismo animal no puede repetirse en el traspaso.',
        ];
    }
}
