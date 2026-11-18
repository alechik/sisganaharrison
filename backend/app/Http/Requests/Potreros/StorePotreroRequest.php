<?php

namespace App\Http\Requests\Potreros;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StorePotreroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('potreros.create') ?? false;
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
            'parcela_id' => [
                'required',
                'integer',
                Rule::exists('parcelas', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'codigo' => 'required|string|max:20|unique:potreros,codigo|regex:/^[A-Z0-9_]+$/',
            'nombre' => 'required|string|max:100',
            'capacidad_animales' => 'nullable|integer|min:0|max:999999',
            'area_ha' => 'nullable|numeric|min:0|max:99999999.99',
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parcela_id.exists' => 'La parcela seleccionada no existe o no está activa.',
            'codigo.regex' => 'El código solo puede contener letras mayúsculas, números y guiones bajos.',
            'codigo.unique' => 'Ya existe un potrero con este código.',
        ];
    }
}
