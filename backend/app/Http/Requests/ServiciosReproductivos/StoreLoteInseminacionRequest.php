<?php

namespace App\Http\Requests\ServiciosReproductivos;

use App\Models\Animal;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLoteInseminacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.create') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fecha_servicio' => 'required|date|before_or_equal:today',
            'observaciones' => 'nullable|string|max:2000',
            'medicamento_id' => 'required|integer|exists:medicamentos,id',
            'hembras' => 'required|array|min:1',
            'hembras.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('animales', 'id')->where(function ($query) {
                    $query->where('estado', Animal::ESTADO_ACTIVO)
                        ->where('sexo', 'H')
                        ->whereNull('deleted_at');
                    Animal::aplicarFiltroAreteValido($query);
                }),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fecha_servicio.required' => 'La fecha de servicio es obligatoria.',
            'fecha_servicio.before_or_equal' => 'La fecha de servicio no puede ser futura.',
            'medicamento_id.required' => 'Debe seleccionar el semen.',
            'hembras.required' => 'Debe seleccionar al menos una vaca.',
            'hembras.*.distinct' => 'La misma vaca no puede repetirse.',
            'hembras.*.exists' => 'La vaca seleccionada no está activa, no tiene arete válido o no es hembra.',
        ];
    }
}
