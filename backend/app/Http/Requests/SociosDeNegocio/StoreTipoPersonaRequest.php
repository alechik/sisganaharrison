<?php

namespace App\Http\Requests\SociosDeNegocio;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreTipoPersonaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tipos_persona.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('nombre')) {
            $this->merge([
                'nombre' => Str::upper(Str::slug((string) $this->input('nombre'), '_')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:50|unique:tipo,nombre|regex:/^[A-Z0-9_]+$/',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.unique' => 'Ya existe un tipo de persona con este nombre.',
            'nombre.regex' => 'El nombre solo puede contener letras mayúsculas, números y guiones bajos.',
        ];
    }
}
