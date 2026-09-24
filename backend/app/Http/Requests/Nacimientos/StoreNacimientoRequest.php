<?php

namespace App\Http\Requests\Nacimientos;

use App\Models\Nacimiento;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNacimientoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $estado = strtoupper((string) $this->input('estado_nacimiento'));
        $merge = [];

        if ($estado === Nacimiento::ESTADO_MUERTO) {
            $merge['animal_id'] = null;
            $merge['animal'] = null;
        } else {
            $merge['animal_id'] = null;
            $merge['causa_muerte'] = null;
        }

        if ($this->exists('arete') && $this->input('arete') === '') {
            $merge['arete'] = null;
        }

        if (is_array($this->input('animal'))) {
            $animal = $this->input('animal');
            foreach (['arete', 'nombre', 'color', 'observaciones'] as $field) {
                if (($animal[$field] ?? '') === '') {
                    $animal[$field] = null;
                }
            }
            foreach (['raza_id', 'estado_productivo_id', 'lote_id'] as $field) {
                if (($animal[$field] ?? '') === '' || ($animal[$field] ?? null) === '0') {
                    $animal[$field] = null;
                }
            }
            if (! empty($animal['arete'])) {
                $animal['arete'] = strtoupper(trim((string) $animal['arete']));
            }
            $merge['animal'] = $estado === Nacimiento::ESTADO_MUERTO ? null : $animal;
            if ($estado !== Nacimiento::ESTADO_MUERTO && empty($merge['arete'])) {
                $merge['arete'] = $animal['arete'] ?? null;
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
        return [
            'parto_id' => 'required|integer|exists:partos,id',
            'arete' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('animales', 'arete'),
            ],
            'sexo' => ['required', 'string', 'size:1', Rule::in(Nacimiento::SEXOS)],
            'peso_nacimiento' => 'nullable|numeric|min:0|max:999999.99',
            'estado_nacimiento' => ['required', 'string', 'max:10', Rule::in(Nacimiento::ESTADOS)],
            'causa_muerte' => 'nullable|string|max:150',
            'observaciones' => 'nullable|string|max:2000',
            'registrado_por' => 'nullable|integer|exists:users,id',
            'animal' => 'nullable|array',
            'animal.arete' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('animales', 'arete'),
            ],
            'animal.nombre' => 'nullable|string|max:100',
            'animal.raza_id' => [
                'nullable',
                'integer',
                Rule::exists('razas', 'id')->whereNull('deleted_at')->where('estado', true),
            ],
            'animal.estado_productivo_id' => [
                'nullable',
                'integer',
                Rule::exists('estados_productivos', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'animal.lote_id' => [
                'nullable',
                'integer',
                Rule::exists('lotes', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'animal.color' => 'nullable|string|max:60',
            'animal.observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parto_id.exists' => 'El parto seleccionado no existe.',
            'arete.unique' => 'El arete ya existe.',
            'animal.arete.unique' => 'El arete ya existe.',
            'registrado_por.exists' => 'El usuario registrador seleccionado no existe.',
            'sexo.in' => 'El sexo seleccionado no es válido.',
            'estado_nacimiento.in' => 'El estado de nacimiento seleccionado no es válido.',
        ];
    }
}
