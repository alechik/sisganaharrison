<?php

namespace App\Http\Resources\Lotes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'potrero_id' => $this->potrero_id,
            'potrero_nombre' => $this->potrero?->nombre,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'capacidad_animales' => $this->capacidad_animales,
            'area_ha' => $this->area_ha !== null ? (float) $this->area_ha : null,
            'observaciones' => $this->observaciones,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
