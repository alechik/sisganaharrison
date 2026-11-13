<?php

namespace App\Http\Requests\Pesajes;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PreviewPesajeExcelRequest extends FormRequest
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
            'archivo' => 'required|file|max:5120',
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
