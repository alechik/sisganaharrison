<?php

namespace App\Http\Requests\Compras;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DecidirOrdenCompraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras.authorize') ?? false;
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
