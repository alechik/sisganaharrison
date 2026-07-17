<?php

namespace App\Http\Resources\Gestaciones;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GestacionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'servicio_id' => $this->servicio_id,
            'servicio_fecha_servicio' => $this->whenLoaded(
                'servicio',
                fn () => $this->servicio->fecha_servicio?->format('Y-m-d')
            ),
            'servicio_tipo_servicio' => $this->whenLoaded(
                'servicio',
                fn () => $this->servicio->tipo_servicio
            ),
            'servicio_resultado' => $this->whenLoaded(
                'servicio',
                fn () => $this->servicio->resultado
            ),
            'servicio_hembra_codigo' => $this->whenLoaded(
                'servicio.hembra',
                fn () => $this->servicio->hembra?->codigo
            ),
            'servicio_hembra_arete' => $this->whenLoaded(
                'servicio.hembra',
                fn () => $this->servicio->hembra?->arete
            ),
            'servicio_macho_codigo' => $this->whenLoaded(
                'servicio.macho',
                fn () => $this->servicio->macho?->codigo
            ),
            'servicio_macho_arete' => $this->whenLoaded(
                'servicio.macho',
                fn () => $this->servicio->macho?->arete
            ),
            'fecha_confirmacion' => $this->fecha_confirmacion?->format('Y-m-d'),
            'fecha_probable_parto' => $this->fecha_probable_parto?->format('Y-m-d'),
            'estado' => $this->estado,
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
