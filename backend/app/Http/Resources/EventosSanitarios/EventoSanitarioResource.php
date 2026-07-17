<?php

namespace App\Http\Resources\EventosSanitarios;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventoSanitarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'animal_id' => $this->animal_id,
            'animal_codigo' => $this->whenLoaded('animal', fn () => $this->animal->codigo),
            'animal_arete' => $this->whenLoaded('animal', fn () => $this->animal->arete),
            'tipo_evento_id' => $this->tipo_evento_id,
            'tipo_evento_nombre' => $this->whenLoaded('tipoEvento', fn () => $this->tipoEvento->nombre),
            'tipo_evento_codigo' => $this->whenLoaded('tipoEvento', fn () => $this->tipoEvento->codigo),
            'vacuna_id' => $this->vacuna_id,
            'vacuna_nombre' => $this->whenLoaded('vacuna', fn () => $this->vacuna?->nombre),
            'fecha' => $this->fecha?->format('Y-m-d'),
            'diagnostico' => $this->diagnostico,
            'tratamiento' => $this->tratamiento,
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
