<?php

namespace App\Http\Requests\Compras;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIngresoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras.create') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        foreach (['observaciones'] as $field) {
            if ($this->exists($field) && $this->input($field) === '') {
                $merge[$field] = null;
            }
        }

        if ($this->exists('detalles') && is_array($this->input('detalles'))) {
            $detalles = [];
            foreach ($this->input('detalles') as $detalle) {
                if (! is_array($detalle)) {
                    $detalles[] = $detalle;

                    continue;
                }

                if (($detalle['observaciones'] ?? '') === '') {
                    $detalle['observaciones'] = null;
                }

                if (isset($detalle['animal']) && is_array($detalle['animal'])) {
                    foreach (['arete', 'nombre', 'fecha_nacimiento', 'color', 'observaciones'] as $field) {
                        if (($detalle['animal'][$field] ?? '') === '') {
                            $detalle['animal'][$field] = null;
                        }
                    }
                    foreach (['raza_id', 'estado_productivo_id', 'madre_id', 'padre_id'] as $field) {
                        if (($detalle['animal'][$field] ?? '') === '' || ($detalle['animal'][$field] ?? null) === '0') {
                            $detalle['animal'][$field] = null;
                        }
                    }
                    if (! empty($detalle['animal']['arete'])) {
                        $detalle['animal']['arete'] = strtoupper(trim((string) $detalle['animal']['arete']));
                    }
                }

                $detalles[] = $detalle;
            }
            $merge['detalles'] = $detalles;
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
            'cuarentena_id' => [
                'required',
                'integer',
                Rule::exists('cuarentenas', 'id')->where('estado', 'COMPLETADO'),
            ],
            'lote_id' => [
                'required',
                'integer',
                Rule::exists('lotes', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'fecha_ingreso' => 'required|date|before_or_equal:today',
            'observaciones' => 'nullable|string|max:2000',
            'descuento' => 'nullable|numeric|min:0',
            'detalles' => 'required|array|min:1',
            'detalles.*.animal_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('animales', 'id')->whereNull('deleted_at'),
            ],
            'detalles.*.peso_ingreso' => 'required|numeric|min:0.01',
            'detalles.*.observaciones' => 'nullable|string|max:2000',
            'detalles.*.animal' => 'nullable|array',
            'detalles.*.animal.arete' => 'nullable|string|max:30',
            'detalles.*.animal.nombre' => 'nullable|string|max:100',
            'detalles.*.animal.fecha_nacimiento' => 'nullable|date|before_or_equal:today',
            'detalles.*.animal.raza_id' => [
                'nullable',
                'integer',
                Rule::exists('razas', 'id')->whereNull('deleted_at')->where('estado', true),
            ],
            'detalles.*.animal.estado_productivo_id' => [
                'nullable',
                'integer',
                Rule::exists('estados_productivos', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'detalles.*.animal.madre_id' => [
                'nullable',
                'integer',
                Rule::exists('animales', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'detalles.*.animal.padre_id' => [
                'nullable',
                'integer',
                Rule::exists('animales', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'detalles.*.animal.color' => 'nullable|string|max:60',
            'detalles.*.animal.observaciones' => 'nullable|string|max:2000',
            'detalles.*.animal.edad_inicial' => 'nullable|integer|min:0|max:600',
            'detalles.*.animal.edad_actual' => 'nullable|integer|min:0|max:600',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cuarentena_id.exists' => 'La cuarentena debe existir y estar completada.',
            'lote_id.exists' => 'El lote seleccionado no existe o no está activo.',
            'detalles.required' => 'Debe seleccionar al menos un animal para el ingreso.',
            'detalles.*.animal_id.distinct' => 'No se puede ingresar el mismo animal más de una vez.',
            'detalles.*.peso_ingreso.min' => 'El peso de ingreso debe ser mayor a cero.',
        ];
    }
}
