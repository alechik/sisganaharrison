<?php

namespace App\Http\Requests\Pesajes;

use App\Models\Animal;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePesajeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('pesajes.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'animal_id' => [
                'required',
                'integer',
                Rule::exists('animales', 'id')
                    ->where('estado', Animal::ESTADO_ACTIVO)
                    ->whereNull('deleted_at'),
            ],
            'fecha' => 'required|date',
            'peso' => 'required|numeric|gt:0|decimal:0,2',
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'animal_id.exists' => 'El animal seleccionado no está activo o no existe.',
            'peso.gt' => 'El peso debe ser mayor a 0.',
            'fecha.required' => 'La fecha es obligatoria.',
        ];
    }
}
