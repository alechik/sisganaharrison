<?php

namespace App\Http\Requests\Partos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePartoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'gestacion_id' => 'required|integer|exists:gestaciones,id',
            'fecha_parto' => 'required|date',
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'gestacion_id.exists' => 'La gestación seleccionada no existe.',
            'fecha_parto.required' => 'La fecha de parto es obligatoria.',
        ];
    }
}
