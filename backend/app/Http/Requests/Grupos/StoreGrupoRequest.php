<?php

namespace App\Http\Requests\Grupos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGrupoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('grupos.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'lote_id' => [
                'required',
                'integer',
                Rule::exists('lotes', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('grupos', 'nombre')
                    ->where(fn ($query) => $query->where('lote_id', $this->input('lote_id'))->whereNull('deleted_at')),
            ],
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'lote_id.exists' => 'El potrero seleccionado no existe o no está activo.',
            'nombre.unique' => 'Ya existe un grupo con este nombre en el potrero.',
        ];
    }
}
