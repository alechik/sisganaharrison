<?php

namespace App\Http\Requests\TiposEventosSanitarios;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateTipoEventoSanitarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tipos_eventos_sanitarios.update') ?? false;
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
            'codigo' => 'required|string|max:20|unique:tipos_eventos_sanitarios,codigo,'.$this->route('tipo_evento_sanitario')->id.'|regex:/^[A-Z0-9_]+$/',
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
            'codigo.unique' => 'Ya existe un tipo de evento sanitario con este código.',
        ];
    }
}
