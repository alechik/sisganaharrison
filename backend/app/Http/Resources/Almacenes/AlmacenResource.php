<?php

namespace App\Http\Resources\Almacenes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlmacenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'establecimiento_id' => $this->establecimiento_id,
            'establecimiento_nombre' => $this->whenLoaded('establecimiento', fn () => $this->establecimiento?->nombre),
            'establecimiento_codigo' => $this->whenLoaded('establecimiento', fn () => $this->establecimiento?->codigo),
            'nombre' => $this->nombre,
            'direccion' => $this->direccion,
            'observacion' => $this->observacion,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
