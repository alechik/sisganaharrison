<?php

namespace App\Http\Requests\Parcelas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreParcelaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('parcelas.create') ?? false;
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
            'estancia_id' => [
                'required',
                'integer',
                Rule::exists('estancias', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'codigo' => 'required|string|max:20|unique:parcelas,codigo|regex:/^[A-Z0-9_]+$/',
            'nombre' => 'required|string|max:100',
            'area_ha' => 'nullable|numeric|min:0|max:99999999.99',
            'tipo_pasto' => 'nullable|string|max:100',
            'disponibilidad' => 'nullable|boolean',
            'descripcion' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'estancia_id.exists' => 'La estancia seleccionada no existe o no está activa.',
            'codigo.regex' => 'El código solo puede contener letras mayúsculas, números y guiones bajos.',
            'codigo.unique' => 'Ya existe una parcela con este código.',
        ];
    }
}
