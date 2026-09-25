<?php

namespace App\Http\Requests\ServiciosReproductivos;

use App\Models\Animal;
use App\Models\ServicioReproductivo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServicioReproductivoRequest extends FormRequest
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
            'hembra_id' => [
                'required',
                'integer',
                Rule::exists('animales', 'id')->where(function ($query) {
                    $query->where('estado', Animal::ESTADO_ACTIVO)
                        ->where('sexo', 'H')
                        ->whereNull('deleted_at');
                    Animal::aplicarFiltroAreteValido($query);
                }),
            ],
            'macho_id' => [
                'nullable',
                'integer',
                Rule::exists('animales', 'id')->where(function ($query) {
                    $query->where('estado', Animal::ESTADO_ACTIVO)
                        ->where('sexo', 'M')
                        ->whereNull('deleted_at');
                    Animal::aplicarFiltroAreteValido($query);
                }),
            ],
            'fecha_servicio' => 'required|date',
            'tipo_servicio' => ['required', 'string', 'max:30', Rule::in(ServicioReproductivo::TIPOS_SERVICIO)],
            'resultado' => ['nullable', 'string', 'max:30', Rule::in(ServicioReproductivo::RESULTADOS)],
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'hembra_id.exists' => 'La hembra seleccionada no está activa, no tiene un arete válido o no es de sexo femenino.',
            'macho_id.exists' => 'El macho seleccionado no está activo, no tiene un arete válido o no es de sexo masculino.',
            'fecha_servicio.required' => 'La fecha de servicio es obligatoria.',
            'tipo_servicio.in' => 'El tipo de servicio seleccionado no es válido.',
            'resultado.in' => 'El resultado seleccionado no es válido.',
        ];
    }
}
