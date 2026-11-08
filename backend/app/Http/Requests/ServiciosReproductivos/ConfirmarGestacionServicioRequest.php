<?php

namespace App\Http\Requests\ServiciosReproductivos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ConfirmarGestacionServicioRequest extends FormRequest
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
            'fecha_confirmacion' => 'required|date|before_or_equal:today',
            'fecha_probable_parto' => 'nullable|date',
            'observaciones' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fecha_confirmacion.required' => 'La fecha de confirmación es obligatoria.',
            'fecha_confirmacion.before_or_equal' => 'La fecha de confirmación no puede ser futura.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $confirmacion = $this->input('fecha_confirmacion');
            $probable = $this->input('fecha_probable_parto');

            if ($confirmacion && $probable && $probable < $confirmacion) {
                $validator->errors()->add(
                    'fecha_probable_parto',
                    'La fecha probable de parto debe ser igual o posterior a la fecha de confirmación.'
                );
            }
        });
    }
}
