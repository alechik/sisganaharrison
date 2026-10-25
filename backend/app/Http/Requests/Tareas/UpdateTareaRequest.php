<?php

namespace App\Http\Requests\Tareas;

use App\Models\Tarea;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTareaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tarea = $this->route('tarea');

        if (! $tarea instanceof Tarea) {
            return false;
        }

        return $this->user()?->can('update', $tarea) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'respuesta_indicacion' => 'required|string|max:5000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'respuesta_indicacion.required' => 'Debe registrar la respuesta de la tarea.',
        ];
    }
}
