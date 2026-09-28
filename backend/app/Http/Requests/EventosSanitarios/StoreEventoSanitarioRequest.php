<?php

namespace App\Http\Requests\EventosSanitarios;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventoSanitarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('sanitario.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tipo_evento_id' => [
                'required',
                'integer',
                Rule::exists('tipos_eventos_sanitarios', 'id')
                    ->where('activo', true)
                    ->whereNull('deleted_at'),
            ],
            'fecha' => 'required|date|before_or_equal:today',
            'diagnostico' => 'nullable|string|max:2000',
            'tratamiento' => 'nullable|string|max:2000',
            'observaciones' => 'nullable|string|max:2000',
            'detalles' => 'required|array|min:1',
            'detalles.*.animal_id' => 'required|integer|distinct|exists:animales,id',
            'detalles.*.medicamento_id' => 'required|integer|exists:medicamentos,id',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tipo_evento_id.exists' => 'El tipo de evento seleccionado no está activo o no existe.',
            'fecha.required' => 'La fecha es obligatoria.',
            'detalles.required' => 'Debe agregar al menos un animal.',
            'detalles.*.animal_id.distinct' => 'El mismo animal no puede repetirse en el evento.',
        ];
    }
}
