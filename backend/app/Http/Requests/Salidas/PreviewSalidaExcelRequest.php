<?php

namespace App\Http\Requests\Salidas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PreviewSalidaExcelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('salidas.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'archivo' => 'required|file|max:5120',
            'tipo_salida_id' => 'nullable|integer|exists:tipos_salidas,id',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'archivo.required' => 'Debe adjuntar el archivo Excel o CSV.',
        ];
    }
}
