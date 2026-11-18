<?php

namespace App\Http\Resources\Potreros;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PotreroResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parcela_id' => $this->parcela_id,
            'parcela_nombre' => $this->parcela?->nombre,
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
