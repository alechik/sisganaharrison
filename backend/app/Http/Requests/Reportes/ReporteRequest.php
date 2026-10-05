<?php

namespace App\Http\Requests\Reportes;

use App\Models\Animal;
use App\Services\Reportes\ReporteService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reportes.view') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $periodo = in_array($this->route('tipo'), ReporteService::TIPOS_PERIODO, true);

        return [
            'desde' => [$periodo ? 'required' : 'nullable', 'date'],
            'hasta' => [$periodo ? 'required' : 'nullable', 'date', 'after_or_equal:desde'],
            'sexo' => ['nullable', Rule::in(['M', 'H'])],
            'raza_id' => ['nullable', 'integer', 'exists:razas,id'],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias_animales,id'],
            'estado_productivo_id' => ['nullable', 'integer', 'exists:estados_productivos,id'],
            'lote_id' => ['nullable', 'integer', 'exists:lotes,id'],
            'estado' => ['nullable', Rule::in(Animal::ESTADOS)],
            'tipo_evento_id' => ['nullable', 'integer', 'exists:tipos_eventos_sanitarios,id'],
            'animal_id' => ['nullable', 'integer', 'exists:animales,id'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'desde.required' => 'Indique la fecha inicial.',
            'hasta.required' => 'Indique la fecha final.',
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtros(): array
    {
        return [
            'desde' => $this->input('desde'),
            'hasta' => $this->input('hasta'),
            'sexo' => $this->input('sexo'),
            'raza_id' => $this->filled('raza_id') ? (int) $this->input('raza_id') : null,
            'categoria_id' => $this->filled('categoria_id') ? (int) $this->input('categoria_id') : null,
            'estado_productivo_id' => $this->filled('estado_productivo_id') ? (int) $this->input('estado_productivo_id') : null,
            'lote_id' => $this->filled('lote_id') ? (int) $this->input('lote_id') : null,
            'estado' => $this->input('estado'),
            'tipo_evento_id' => $this->filled('tipo_evento_id') ? (int) $this->input('tipo_evento_id') : null,
            'animal_id' => $this->filled('animal_id') ? (int) $this->input('animal_id') : null,
            'page' => (int) $this->input('page', 1),
            'per_page' => (int) $this->input('per_page', 25),
            'para_pdf' => false,
        ];
    }
}
