<?php

namespace App\Http\Requests\Medicamentos;

use App\Models\Medicamento;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateMedicamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('medicamentos.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('codigo')) {
            $this->merge([
                'codigo' => Str::upper(Str::slug((string) $this->input('codigo'), '_')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Medicamento|null $medicamento */
        $medicamento = $this->route('medicamento');

        return [
            'presentacion_id' => 'required|integer|exists:presentaciones,id',
            'codigo' => [
                'required',
                'string',
                'max:20',
                'regex:/^[A-Z0-9_]+$/',
                Rule::unique('medicamentos', 'codigo')->ignore($medicamento?->id),
            ],
            'nombre' => 'required|string|max:100',
            'laboratorio' => 'nullable|string|max:120',
            'precio' => 'required|numeric|min:0|max:999999.99',
            'descripcion' => 'required|string|max:2000',
            'activo' => 'sometimes|boolean',
        ];
    }
}
