<?php

namespace App\Http\Resources\Parcelas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParcelaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'estancia_id' => $this->estancia_id,
            'estancia_nombre' => $this->estancia?->nombre,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'area_ha' => $this->area_ha !== null ? (float) $this->area_ha : null,
            'tipo_pasto' => $this->tipo_pasto,
            'disponibilidad' => $this->disponibilidad,
            'descripcion' => $this->descripcion,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
