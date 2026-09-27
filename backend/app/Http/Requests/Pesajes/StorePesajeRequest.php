<?php

namespace App\Http\Requests\Pesajes;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePesajeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('pesajes.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fecha_pesaje' => 'required|date|before_or_equal:today',
            'observacion' => 'nullable|string|max:2000',
            'detalles' => 'required|array|min:1',
            'detalles.*.animal_id' => 'required|integer|distinct|exists:animales,id',
            'detalles.*.peso' => 'required|numeric|min:0.01|max:999999.99',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fecha_pesaje.required' => 'La fecha de pesaje es obligatoria.',
            'detalles.required' => 'Debe agregar al menos un animal.',
            'detalles.*.animal_id.distinct' => 'El mismo animal no puede repetirse en el pesaje.',
            'detalles.*.peso.min' => 'El peso debe ser mayor a 0.',
        ];
    }
}
