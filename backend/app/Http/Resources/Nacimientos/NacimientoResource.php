<?php

namespace App\Http\Resources\Nacimientos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NacimientoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parto_id' => $this->parto_id,
            'parto_fecha_parto' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->fecha_parto?->format('Y-m-d')
            ),
            'parto_gestacion_estado' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->gestacion?->estado
            ),
            'parto_gestacion_servicio_fecha_servicio' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->gestacion?->servicio?->fecha_servicio?->format('Y-m-d')
            ),
            'parto_gestacion_servicio_tipo_servicio' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->gestacion?->servicio?->tipo_servicio
            ),
            'parto_gestacion_servicio_hembra_codigo' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->gestacion?->servicio?->hembra?->codigo
            ),
            'parto_gestacion_servicio_hembra_arete' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->gestacion?->servicio?->hembra?->arete
            ),
            'parto_gestacion_servicio_macho_codigo' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->gestacion?->servicio?->macho?->codigo
            ),
            'parto_gestacion_servicio_macho_arete' => $this->whenLoaded(
                'parto',
                fn () => $this->parto->gestacion?->servicio?->macho?->arete
            ),
            'animal_id' => $this->animal_id,
            'animal_codigo' => $this->whenLoaded(
                'animal',
                fn () => $this->animal?->codigo
            ),
            'animal_arete' => $this->whenLoaded(
                'animal',
                fn () => $this->animal?->arete
            ),
            'registrado_por' => $this->registrado_por,
            'registrado_por_nombre' => $this->whenLoaded(
                'registradoPor',
                fn () => trim("{$this->registradoPor->nombre} {$this->registradoPor->apellido}")
            ),
            'arete' => $this->arete,
            'sexo' => $this->sexo,
            'peso_nacimiento' => $this->peso_nacimiento !== null
                ? (float) $this->peso_nacimiento
                : null,
            'estado_nacimiento' => $this->estado_nacimiento,
            'causa_muerte' => $this->causa_muerte,
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
