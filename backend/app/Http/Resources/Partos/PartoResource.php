<?php

namespace App\Http\Resources\Partos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'gestacion_id' => $this->gestacion_id,
            'gestacion_estado' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->estado
            ),
            'gestacion_fecha_confirmacion' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->fecha_confirmacion?->format('Y-m-d')
            ),
            'gestacion_fecha_probable_parto' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->fecha_probable_parto?->format('Y-m-d')
            ),
            'gestacion_servicio_fecha_servicio' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->servicio?->fecha_servicio?->format('Y-m-d')
            ),
            'gestacion_servicio_tipo_servicio' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->servicio?->tipo_servicio
            ),
            'gestacion_servicio_resultado' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->servicio?->resultado
            ),
            'gestacion_servicio_hembra_codigo' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->servicio?->hembra?->codigo
            ),
            'gestacion_servicio_hembra_arete' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->servicio?->hembra?->arete
            ),
            'gestacion_servicio_macho_codigo' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->servicio?->macho?->codigo
            ),
            'gestacion_servicio_macho_arete' => $this->whenLoaded(
                'gestacion',
                fn () => $this->gestacion->servicio?->macho?->arete
            ),
            'fecha_parto' => $this->fecha_parto?->format('Y-m-d'),
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
