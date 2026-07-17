<?php

namespace App\Http\Resources\Pesajes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PesajeResource extends JsonResource
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
            'fecha' => $this->fecha?->format('Y-m-d'),
            'peso' => (float) $this->peso,
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
