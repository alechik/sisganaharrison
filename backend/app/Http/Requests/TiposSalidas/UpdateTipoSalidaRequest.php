<?php

namespace App\Http\Requests\TiposSalidas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTipoSalidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tipos_salidas.update') ?? false;
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
        $tipoSalida = $this->route('tipo_salida');

        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tipos_salidas', 'nombre')->ignore($tipoSalida?->id),
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
