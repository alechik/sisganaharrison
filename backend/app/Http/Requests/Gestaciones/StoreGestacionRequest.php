<?php

namespace App\Http\Requests\Gestaciones;

use App\Models\Gestacion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGestacionRequest extends FormRequest
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
            'servicio_id' => 'required|integer|exists:servicios_reproductivos,id',
            'fecha_confirmacion' => 'nullable|date',
            'fecha_probable_parto' => 'nullable|date|after_or_equal:fecha_confirmacion',
            'estado' => ['required', 'string', 'max:30', Rule::in(Gestacion::ESTADOS)],
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'servicio_id.exists' => 'El servicio reproductivo seleccionado no existe.',
            'estado.in' => 'El estado seleccionado no es válido.',
            'fecha_probable_parto.after_or_equal' => 'La fecha probable de parto debe ser igual o posterior a la fecha de confirmación.',
        ];
    }
}
