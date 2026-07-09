<?php

namespace App\Http\Resources\Establecimientos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstablecimientoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'propietario' => $this->propietario,
            'telefono' => $this->telefono,
            'direccion' => $this->direccion,
            'municipio' => $this->municipio,
            'departamento' => $this->departamento,
            'pais' => $this->pais,
            'area_total_ha' => $this->area_total_ha !== null ? (float) $this->area_total_ha : null,
            'descripcion' => $this->descripcion,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
