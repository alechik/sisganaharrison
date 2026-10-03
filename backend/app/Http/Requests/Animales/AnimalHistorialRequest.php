<?php

namespace App\Http\Requests\Animales;

use App\Services\AnimalHistorialService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnimalHistorialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('animales.view') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $tipo = $this->input('tipo');

        if ($tipo !== null && ! is_array($tipo)) {
            $this->merge(['tipo' => [$tipo]]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tipo' => ['sometimes', 'array'],
            'tipo.*' => ['required', 'string', Rule::in(AnimalHistorialService::TIPOS)],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ];
    }
}
