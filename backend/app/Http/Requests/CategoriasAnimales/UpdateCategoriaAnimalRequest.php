<?php

namespace App\Http\Requests\CategoriasAnimales;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateCategoriaAnimalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('categorias_animales.update') ?? false;
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
            'codigo' => 'required|string|max:20|unique:categorias_animales,codigo,'.$this->route('categoria')->id.'|regex:/^[A-Z0-9_]+$/',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:1000',
            'sexo' => 'nullable|in:M,H',
            'edad_min_meses' => 'nullable|integer|min:0|max:600',
            'edad_max_meses' => 'nullable|integer|min:0|max:600|gte:edad_min_meses',
            'castrado' => 'nullable|boolean',
            'caracteristica' => 'nullable|string|max:255',
            'peso_min_kg' => 'nullable|numeric|min:0|max:9999.99',
            'peso_max_kg' => 'nullable|numeric|min:0|max:9999.99|gte:peso_min_kg',
            'peso_referencia_meses' => 'nullable|integer|min:0|max:600',
            'cambio_peso_meses' => 'nullable|integer|min:1|max:24',
            'indice_aumento' => 'nullable|numeric|min:0|max:9999.99',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.regex' => 'El código solo puede contener letras mayúsculas, números y guiones bajos.',
            'codigo.unique' => 'Ya existe una categoría con este código.',
        ];
    }
}
