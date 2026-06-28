<?php

namespace App\Http\Requests\CategoriasAnimales;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoriaAnimalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('categorias_animales.create') ?? false;
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
            'codigo' => 'required|string|max:20|unique:categorias_animales,codigo|regex:/^[A-Z0-9_]+$/',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:1000',
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
