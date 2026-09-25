<?php

namespace App\Http\Requests\Ventas;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DecidirVentaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('ventas.authorize') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'observacion' => 'nullable|string|max:255',
        ];
    }
}
