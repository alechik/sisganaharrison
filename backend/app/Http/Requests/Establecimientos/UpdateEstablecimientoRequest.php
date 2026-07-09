<?php

namespace App\Http\Requests\Establecimientos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateEstablecimientoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('establecimientos.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('codigo')) {
            $this->merge([
                'codigo' => Str::upper(Str::slug((string) $this->input('codigo'), '_')),
            ]);
        }

        if (! $this->filled('pais')) {
            $this->merge(['pais' => 'Bolivia']);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'codigo' => 'required|string|max:20|unique:establecimientos,codigo,'.$this->route('establecimiento')->id.'|regex:/^[A-Z0-9_]+$/',
            'nombre' => 'required|string|max:150',
            'propietario' => 'nullable|string|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:255',
            'municipio' => 'nullable|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'pais' => 'nullable|string|max:100',
            'area_total_ha' => 'nullable|numeric|min:0|max:99999999.99',
            'descripcion' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.regex' => 'El código solo puede contener letras mayúsculas, números y guiones bajos.',
            'codigo.unique' => 'Ya existe un establecimiento con este código.',
        ];
    }
}
