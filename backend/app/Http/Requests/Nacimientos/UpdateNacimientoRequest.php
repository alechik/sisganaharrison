<?php

namespace App\Http\Requests\Nacimientos;

use App\Models\Nacimiento;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateNacimientoRequest extends StoreNacimientoRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.update') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $nacimiento = $this->route('nacimiento');
        $animalId = $nacimiento instanceof Nacimiento ? $nacimiento->animal_id : null;

        $rules['arete'] = [
            'nullable',
            'string',
            'max:30',
            Rule::unique('animales', 'arete')->ignore($animalId),
        ];
        $rules['animal.arete'] = [
            'nullable',
            'string',
            'max:30',
            Rule::unique('animales', 'arete')->ignore($animalId),
        ];

        return $rules;
    }
}
