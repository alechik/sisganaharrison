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
            'animal_id' => [
                'required',
                'integer',
                Rule::exists('animales', 'id')
                    ->where('activo', true)
                    ->whereNull('deleted_at'),
            ],
            'tipo_evento_id' => [
                'required',
                'integer',
                Rule::exists('tipos_eventos_sanitarios', 'id')
                    ->where('activo', true)
                    ->whereNull('deleted_at'),
            ],
            'vacuna_id' => [
                'nullable',
                'integer',
                Rule::exists('vacunas', 'id')
                    ->where('activo', true)
                    ->whereNull('deleted_at'),
            ],
            'fecha' => 'required|date',
            'diagnostico' => 'nullable|string|max:2000',
            'tratamiento' => 'nullable|string|max:2000',
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'animal_id.exists' => 'El animal seleccionado no está activo o no existe.',
            'tipo_evento_id.exists' => 'El tipo de evento seleccionado no está activo o no existe.',
            'vacuna_id.exists' => 'La vacuna seleccionada no está activa o no existe.',
            'fecha.required' => 'La fecha es obligatoria.',
        ];
    }
}
