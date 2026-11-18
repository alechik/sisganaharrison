<?php

namespace App\Http\Requests\Compras;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
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

        foreach (['observaciones', 'proveedor_id', 'grupo_id'] as $field) {
            if ($this->exists($field) && ($this->input($field) === '' || $this->input($field) === '0')) {
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

                foreach (['observaciones', 'color'] as $field) {
                    if (($detalle[$field] ?? '') === '') {
                        $detalle[$field] = null;
                    }
                }

                if (($detalle['raza_id'] ?? '') === '' || ($detalle['raza_id'] ?? null) === '0') {
                    $detalle['raza_id'] = null;
                }

                if (! empty($detalle['arete'])) {
                    $detalle['arete'] = Str::upper(trim((string) $detalle['arete']));
                }

                if (! empty($detalle['sexo'])) {
                    $detalle['sexo'] = Str::upper(trim((string) $detalle['sexo']));
                }

                if (array_key_exists('peso_kg', $detalle) && ! array_key_exists('peso_ingreso', $detalle)) {
                    $detalle['peso_ingreso'] = $detalle['peso_kg'];
                }

                if (array_key_exists('precio', $detalle) && ! array_key_exists('precio_compra', $detalle)) {
                    $detalle['precio_compra'] = $detalle['precio'];
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
            'tipo_ingreso_id' => [
                'required',
                'integer',
                Rule::exists('tipos_ingresos', 'id')->whereNull('deleted_at')->where('estado', true),
            ],
            'proveedor_id' => [
                'nullable',
                'integer',
                Rule::exists('personas', 'id')->whereNull('deleted_at'),
            ],
            'potrero_id' => [
                'required',
                'integer',
                Rule::exists('potreros', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'grupo_id' => [
                'required',
                'integer',
                Rule::exists('grupos', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'fecha_ingreso' => 'required|date|before_or_equal:today',
            'observaciones' => 'nullable|string|max:2000',
            'descuento' => 'nullable|numeric|min:0',
            'detalles' => 'required|array|min:1',
            'detalles.*.arete' => 'required|string|max:30|distinct',
            'detalles.*.sexo' => 'required|string|in:M,H',
            'detalles.*.edad' => 'required|integer|min:0|max:600',
            'detalles.*.peso_ingreso' => 'required|numeric|min:0.01',
            'detalles.*.precio_compra' => 'nullable|numeric|min:0',
            'detalles.*.categoria_id' => [
                'required',
                'integer',
                Rule::exists('categorias_animales', 'id')->whereNull('deleted_at')->where('activo', true),
            ],
            'detalles.*.raza_id' => [
                'required',
                'integer',
                Rule::exists('razas', 'id')->whereNull('deleted_at')->where('estado', true),
            ],
            'detalles.*.color' => 'nullable|string|max:60',
            'detalles.*.observaciones' => 'nullable|string|max:2000',
            'detalles.*.castrado' => 'nullable|boolean',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tipo_ingreso_id.exists' => 'El tipo de ingreso no existe o no está activo.',
            'potrero_id.exists' => 'El potrero seleccionado no existe o no está activo.',
            'grupo_id.required' => 'Debe seleccionar un grupo del potrero.',
            'detalles.required' => 'Debe registrar al menos un animal para el ingreso.',
            'detalles.*.arete.distinct' => 'No se puede repetir el mismo arete en el ingreso.',
            'detalles.*.peso_ingreso.min' => 'El peso debe ser mayor a cero.',
            'detalles.*.raza_id.required' => 'La raza es obligatoria.',
        ];
    }
}
