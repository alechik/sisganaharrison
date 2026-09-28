<?php

namespace App\Http\Requests\Presentaciones;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePresentacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('presentaciones.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('descripcion')) {
            $this->merge([
                'descripcion' => trim((string) $this->input('descripcion')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'descripcion' => [
                'required',
                'string',
                'max:50',
                Rule::unique('presentaciones', 'descripcion'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.unique' => 'Ya existe una presentación con esta descripción.',
        ];
    }
}
