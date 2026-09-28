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
        /** @var Presentacion|null $presentacion */
        $presentacion = $this->route('presentacion');

        return [
            'descripcion' => [
                'required',
                'string',
                'max:50',
                Rule::unique('presentaciones', 'descripcion')->ignore($presentacion?->id),
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
