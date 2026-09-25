<?php

namespace App\Http\Requests\Animales;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateAnimalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('animales.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('codigo')) {
            $codigo = Str::upper(trim((string) $this->input('codigo')));
            $merge['codigo'] = $codigo === '' ? null : $codigo;
        }

        if ($this->has('arete')) {
            $arete = Str::upper(trim((string) $this->input('arete')));
            $merge['arete'] = $arete === '' ? null : $arete;
        }

        foreach (['fecha_nacimiento', 'nombre', 'color', 'observaciones', 'edad_inicial', 'edad_actual'] as $field) {
            if ($this->exists($field) && $this->input($field) === '') {
                $merge[$field] = null;
            }
        }

        foreach (['raza_id', 'estado_productivo_id', 'lote_id', 'madre_id', 'padre_id'] as $field) {
            if ($this->exists($field) && ($this->input($field) === '' || $this->input($field) === '0')) {
                $merge[$field] = null;
            }
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
        $animalId = $this->route('animal')->id;

        return [
            'codigo' => 'required|string|max:30|unique:animales,codigo,'.$animalId,
            'arete' => 'nullable|string|max:30|unique:animales,arete,'.$animalId,
            'nombre' => 'nullable|string|max:100',
            'sexo' => 'required|string|in:M,H',
            'fecha_nacimiento' => 'nullable|date|before_or_equal:today',
            'raza_id' => [
                'nullable',
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
                'nullable',
                'integer',
                Rule::exists('estados_productivos', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'lote_id' => [
                'nullable',
                'integer',
                Rule::exists('lotes', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'madre_id' => [
                'nullable',
                'integer',
                'not_in:'.$animalId,
                Rule::exists('animales', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'padre_id' => [
                'nullable',
                'integer',
                'not_in:'.$animalId,
                Rule::exists('animales', 'id')
                    ->whereNull('deleted_at')
                    ->where('activo', true),
            ],
            'color' => 'nullable|string|max:60',
            'observaciones' => 'nullable|string|max:2000',
            'edad_inicial' => 'nullable|integer|min:0|max:600',
            'edad_actual' => 'nullable|integer|min:0|max:600',
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
            'madre_id.not_in' => 'Un animal no puede ser su propia madre.',
            'padre_id.exists' => 'El padre seleccionado no existe o no está activo.',
            'padre_id.not_in' => 'Un animal no puede ser su propio padre.',
            'edad_inicial.integer' => 'La edad inicial debe expresarse en meses.',
            'edad_actual.integer' => 'La edad actual debe expresarse en meses.',
        ];
    }
}
