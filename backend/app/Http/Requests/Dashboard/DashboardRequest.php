<?php

namespace App\Http\Requests\Dashboard;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class DashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'periodo' => ['nullable', Rule::in(['mes', 'trimestre', 'anio', 'rango'])],
            'desde' => ['required_if:periodo,rango', 'nullable', 'date'],
            'hasta' => ['required_if:periodo,rango', 'nullable', 'date', 'after_or_equal:desde'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'desde.required_if' => 'Indique la fecha inicial.',
            'hasta.required_if' => 'Indique la fecha final.',
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
        ];
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    public function periodo(): array
    {
        $hoy = now();

        return match ($this->input('periodo', 'anio')) {
            'mes' => [$hoy->copy()->startOfMonth(), $hoy->copy()->endOfDay()],
            'trimestre' => [$hoy->copy()->startOfQuarter(), $hoy->copy()->endOfDay()],
            'rango' => [
                Carbon::parse($this->input('desde'))->startOfDay(),
                Carbon::parse($this->input('hasta'))->endOfDay(),
            ],
            default => [$hoy->copy()->startOfYear(), $hoy->copy()->endOfDay()],
        };
    }
}
