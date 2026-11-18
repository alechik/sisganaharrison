<?php

namespace App\Http\Requests\Presentaciones;

use App\Models\Presentacion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePresentacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('presentaciones.update') ?? false;
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
        /** @var Presentacion|null $presentacion */
        $presentacion = $this->route('presentacion');

        return [
            'nombre' => [
                'required',
                'string',
                'max:50',
                Rule::unique('presentaciones', 'nombre')->ignore($presentacion?->id),
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
            'nombre.unique' => 'Ya existe una presentación con este nombre.',
        ];
    }
}
