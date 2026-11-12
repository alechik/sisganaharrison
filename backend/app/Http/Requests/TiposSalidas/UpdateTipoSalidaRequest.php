<?php

namespace App\Http\Requests\TiposSalidas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateTipoSalidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tipos_salidas.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('nombre')) {
            $merge['nombre'] = trim((string) $this->input('nombre'));
        }

        if ($this->has('codigo')) {
            $merge['codigo'] = Str::upper(Str::slug((string) $this->input('codigo'), '_'));
        }

        if ($this->has('iniciales')) {
            $merge['iniciales'] = Str::upper((string) preg_replace('/[^A-Za-z0-9]/', '', (string) $this->input('iniciales')));
        }

        if ($this->exists('descripcion') && $this->input('descripcion') === '') {
            $merge['descripcion'] = null;
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tipoSalida = $this->route('tipo_salida');
        $id = $tipoSalida?->id;

        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tipos_salidas', 'nombre')->ignore($id),
            ],
            'codigo' => 'required|string|max:20|unique:tipos_salidas,codigo,'.$id.'|regex:/^[A-Z0-9_]+$/',
            'iniciales' => 'required|string|min:1|max:10|unique:tipos_salidas,iniciales,'.$id.'|regex:/^[A-Z0-9]+$/',
            'descripcion' => 'nullable|string|max:1000',
            'requiere_cliente' => 'nullable|boolean',
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
            'codigo.regex' => 'El código solo puede contener letras mayúsculas, números y guiones bajos.',
            'codigo.unique' => 'Ya existe un tipo de salida con este código.',
            'iniciales.regex' => 'Las iniciales solo pueden contener letras mayúsculas y números.',
            'iniciales.unique' => 'Ya existe un tipo de salida con estas iniciales.',
        ];
    }
}
