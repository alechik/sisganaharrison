<?php

namespace App\Http\Requests\Nacimientos;

use App\Models\Nacimiento;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNacimientoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'parto_id' => 'required|integer|exists:partos,id',
            'animal_id' => 'nullable|integer|exists:animales,id',
            'arete' => 'nullable|string|max:30',
            'sexo' => ['required', 'string', 'size:1', Rule::in(Nacimiento::SEXOS)],
            'peso_nacimiento' => 'nullable|numeric|min:0|max:999999.99',
            'estado_nacimiento' => ['required', 'string', 'max:10', Rule::in(Nacimiento::ESTADOS)],
            'causa_muerte' => 'nullable|string|max:150',
            'observaciones' => 'nullable|string|max:2000',
            'registrado_por' => 'nullable|integer|exists:users,id',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parto_id.exists' => 'El parto seleccionado no existe.',
            'animal_id.exists' => 'El animal seleccionado no existe.',
            'registrado_por.exists' => 'El usuario registrador seleccionado no existe.',
            'sexo.in' => 'El sexo seleccionado no es válido.',
            'estado_nacimiento.in' => 'El estado de nacimiento seleccionado no es válido.',
        ];
    }
}
