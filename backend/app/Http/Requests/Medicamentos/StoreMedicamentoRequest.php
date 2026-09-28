<?php

namespace App\Http\Requests\Medicamentos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreMedicamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('medicamentos.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('codigo')) {
            $this->merge([
                'codigo' => Str::upper(Str::slug((string) $this->input('codigo'), '_')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'presentacion_id' => 'required|integer|exists:presentaciones,id',
            'codigo' => 'required|string|max:20|unique:medicamentos,codigo|regex:/^[A-Z0-9_]+$/',
            'nombre' => 'required|string|max:100',
            'laboratorio' => 'nullable|string|max:120',
            'precio' => 'required|numeric|min:0|max:999999.99',
            'descripcion' => 'required|string|max:2000',
            'activo' => 'sometimes|boolean',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'presentacion_id.required' => 'Debe seleccionar una presentación.',
            'presentacion_id.exists' => 'La presentación seleccionada no existe.',
            'codigo.unique' => 'Ya existe un medicamento con este código.',
            'nombre.required' => 'El nombre es obligatorio.',
            'precio.required' => 'El precio es obligatorio.',
            'descripcion.required' => 'La descripción es obligatoria.',
        ];
    }
}
