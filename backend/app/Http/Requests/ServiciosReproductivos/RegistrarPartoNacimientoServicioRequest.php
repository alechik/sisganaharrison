<?php

namespace App\Http\Requests\ServiciosReproductivos;

use App\Models\Nacimiento;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegistrarPartoNacimientoServicioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $nacimiento = is_array($this->input('nacimiento')) ? $this->input('nacimiento') : [];
        $estado = strtoupper((string) ($nacimiento['estado_nacimiento'] ?? ''));

        if ($estado === Nacimiento::ESTADO_MUERTO) {
            $nacimiento['animal'] = null;
            $nacimiento['arete'] = null;
        } else {
            $nacimiento['causa_muerte'] = null;
        }

        if (isset($nacimiento['arete']) && $nacimiento['arete'] === '') {
            $nacimiento['arete'] = null;
        }

        if (is_array($nacimiento['animal'] ?? null)) {
            $animal = $nacimiento['animal'];
            foreach (['arete', 'nombre', 'color', 'observaciones'] as $field) {
                if (($animal[$field] ?? '') === '') {
                    $animal[$field] = null;
                }
            }
            foreach (['raza_id', 'estado_productivo_id', 'potrero_id', 'grupo_id'] as $field) {
                if (($animal[$field] ?? '') === '' || ($animal[$field] ?? null) === '0') {
                    $animal[$field] = null;
                }
            }
            if (! empty($animal['arete'])) {
                $animal['arete'] = strtoupper(trim((string) $animal['arete']));
            }
            $nacimiento['animal'] = $estado === Nacimiento::ESTADO_MUERTO ? null : $animal;
            if ($estado !== Nacimiento::ESTADO_MUERTO && empty($nacimiento['arete'])) {
                $nacimiento['arete'] = $animal['arete'] ?? null;
            }
        }

        $this->merge(['nacimiento' => $nacimiento]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fecha_parto' => 'required|date',
            'observaciones' => 'nullable|string|max:2000',
            'nacimiento' => 'required|array',
            'nacimiento.sexo' => ['required', 'string', 'size:1', Rule::in(Nacimiento::SEXOS)],
            'nacimiento.peso_nacimiento' => 'nullable|numeric|min:0|max:999999.99',
            'nacimiento.estado_nacimiento' => ['required', 'string', 'max:10', Rule::in(Nacimiento::ESTADOS)],
            'nacimiento.causa_muerte' => 'nullable|string|max:150',
            'nacimiento.observaciones' => 'nullable|string|max:2000',
            'nacimiento.arete' => ['nullable', 'string', 'max:30', Rule::unique('animales', 'arete')],
            'nacimiento.animal' => 'nullable|array',
            'nacimiento.animal.arete' => ['nullable', 'string', 'max:30', Rule::unique('animales', 'arete')],
            'nacimiento.animal.nombre' => 'nullable|string|max:100',
            'nacimiento.animal.raza_id' => [
                'nullable',
                'integer',
                Rule::exists('razas', 'id')->whereNull('deleted_at')->where('estado', true),
            ],
            'nacimiento.animal.estado_productivo_id' => [
                'nullable',
                'integer',
                Rule::exists('estados_productivos', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'nacimiento.animal.potrero_id' => [
                'nullable',
                'integer',
                Rule::exists('potreros', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'nacimiento.animal.grupo_id' => [
                'nullable',
                'integer',
                Rule::exists('grupos', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'nacimiento.animal.color' => 'nullable|string|max:60',
            'nacimiento.animal.observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fecha_parto.required' => 'La fecha de parto es obligatoria.',
            'nacimiento.required' => 'Debe registrar el nacimiento asociado al parto.',
            'nacimiento.sexo.required' => 'El sexo de la cría es obligatorio.',
            'nacimiento.estado_nacimiento.required' => 'Debe indicar si el nacimiento es VIVO o MUERTO.',
            'nacimiento.animal.arete.unique' => 'El arete ya existe.',
            'nacimiento.arete.unique' => 'El arete ya existe.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $nacimiento = is_array($this->input('nacimiento')) ? $this->input('nacimiento') : [];
            $estado = strtoupper((string) ($nacimiento['estado_nacimiento'] ?? ''));

            if ($estado === Nacimiento::ESTADO_MUERTO && blank($nacimiento['causa_muerte'] ?? null)) {
                $validator->errors()->add(
                    'nacimiento.causa_muerte',
                    'La causa de muerte es obligatoria para nacimientos muertos.'
                );
            }
        });
    }
}
