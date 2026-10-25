<?php

namespace App\Http\Requests\Tareas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTareaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Tarea::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_trabajador_id' => 'required|integer|exists:users,id',
            'indicacion' => 'required|string|max:5000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_trabajador_id.required' => 'Debe seleccionar el usuario asignado.',
            'user_trabajador_id.exists' => 'El usuario asignado no existe.',
            'indicacion.required' => 'Debe indicar las instrucciones de la tarea.',
        ];
    }
}
