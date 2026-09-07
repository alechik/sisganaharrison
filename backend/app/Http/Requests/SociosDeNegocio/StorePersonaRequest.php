<?php

namespace App\Http\Requests\SociosDeNegocio;

use App\Models\Persona;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePersonaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('socios.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'razon_social' => 'required|string|max:255',
            'responsable' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:personas,email',
            'fecha_nacimiento' => 'nullable|date',
            'ci' => 'nullable|integer',
            'nit' => 'nullable|string|max:30',
            'celular' => 'nullable|integer',
            'estado_civil' => ['nullable', 'string', 'max:30', Rule::in(Persona::ESTADOS_CIVILES)],
            'sexo' => ['nullable', 'string', 'max:30', Rule::in(Persona::SEXOS)],
            'direccion' => 'nullable|string|max:100',
            'tipo_ids' => 'required|array|min:1',
            'tipo_ids.*' => 'integer|distinct|exists:tipo,id',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'razon_social.required' => 'La razón social es obligatoria.',
            'email.unique' => 'Ya existe un socio de negocio con este correo.',
            'tipo_ids.required' => 'Debe seleccionar al menos un tipo de persona.',
            'tipo_ids.*.distinct' => 'No se puede asignar el mismo tipo más de una vez.',
            'tipo_ids.*.exists' => 'El tipo de persona seleccionado no existe.',
        ];
    }
}
