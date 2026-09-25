<?php

namespace App\Http\Requests\TiposSalidas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTipoSalidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tipos_salidas.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('nombre')) {
            $this->merge([
                'nombre' => trim((string) $this->input('nombre')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tipos_salidas', 'nombre'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.unique' => 'Ya existe un tipo de salida con este nombre.',
        ];
    }
}
