<?php

namespace App\Http\Resources\ServiciosReproductivos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicioReproductivoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'hembra_id' => $this->hembra_id,
            'hembra_codigo' => $this->whenLoaded('hembra', fn () => $this->hembra->codigo),
            'hembra_arete' => $this->whenLoaded('hembra', fn () => $this->hembra->arete),
            'macho_id' => $this->macho_id,
            'macho_codigo' => $this->whenLoaded('macho', fn () => $this->macho?->codigo),
            'macho_arete' => $this->whenLoaded('macho', fn () => $this->macho?->arete),
            'fecha_servicio' => $this->fecha_servicio?->format('Y-m-d'),
            'tipo_servicio' => $this->tipo_servicio,
            'resultado' => $this->resultado,
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
