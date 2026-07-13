<?php

namespace App\Http\Requests\Animales;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreAnimalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('animales.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('codigo')) {
            $merge['codigo'] = Str::upper(trim((string) $this->input('codigo')));
        }

        if ($this->has('arete') && $this->input('arete') !== null && $this->input('arete') !== '') {
            $merge['arete'] = Str::upper(trim((string) $this->input('arete')));
        }

        if ($this->has('madre_id') && ($this->input('madre_id') === '' || $this->input('madre_id') === '0')) {
            $merge['madre_id'] = null;
        }

        if ($this->has('padre_id') && ($this->input('padre_id') === '' || $this->input('padre_id') === '0')) {
            $merge['padre_id'] = null;
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'codigo' => 'required|string|max:30|unique:animales,codigo',
            'arete' => 'nullable|string|max:30|unique:animales,arete',
            'nombre' => 'nullable|string|max:100',
            'sexo' => 'required|string|in:M,H',
            'fecha_nacimiento' => 'required|date|before_or_equal:today',
            'raza_id' => [
                'required',
                'integer',
                Rule::exists('razas', 'id')
                    ->whereNull('deleted_at')
                    ->where('estado', true),
            ],
            'categoria_id' => [
                'required',
                'integer',
                Rule::exists('categorias_animales', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'estado_productivo_id' => [
                'required',
                'integer',
                Rule::exists('estados_productivos', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'lote_id' => [
                'required',
                'integer',
                Rule::exists('lotes', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'madre_id' => [
                'nullable',
                'integer',
                Rule::exists('animales', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'padre_id' => [
                'nullable',
                'integer',
                Rule::exists('animales', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'color' => 'nullable|string|max:60',
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.unique' => 'Ya existe un animal con este código.',
            'arete.unique' => 'Ya existe un animal con este arete.',
            'sexo.in' => 'El sexo debe ser M (macho) o H (hembra).',
            'raza_id.exists' => 'La raza seleccionada no existe o no está activa.',
            'categoria_id.exists' => 'La categoría seleccionada no existe o no está activa.',
            'estado_productivo_id.exists' => 'El estado productivo seleccionado no existe o no está activo.',
            'lote_id.exists' => 'El lote seleccionado no existe o no está activo.',
            'madre_id.exists' => 'La madre seleccionada no existe o no está activa.',
            'padre_id.exists' => 'El padre seleccionado no existe o no está activo.',
        ];
    }
}
