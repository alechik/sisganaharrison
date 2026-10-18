<?php

namespace App\Http\Requests\Almacenes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAlmacenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('almacenes.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'establecimiento_id' => [
                'required',
                'integer',
                Rule::exists('establecimientos', 'id')->whereNull('deleted_at'),
                Rule::unique('almacenes', 'establecimiento_id')->whereNull('deleted_at'),
            ],
            'nombre' => 'required|string|max:100',
            'direccion' => 'nullable|string|max:150',
            'observacion' => 'nullable|string|max:2000',
        ];
    }
}
