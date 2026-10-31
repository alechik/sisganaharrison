<?php

namespace App\Http\Requests\InformesDiarios;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreInformeDiarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\InformeDiario::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fecha' => 'required|date',
            'detalle_informe' => 'required|string|max:10000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fecha.required' => 'Debe indicar la fecha del informe.',
            'fecha.date' => 'La fecha del informe no es válida.',
            'detalle_informe.required' => 'Debe registrar el contenido del informe.',
        ];
    }
}
