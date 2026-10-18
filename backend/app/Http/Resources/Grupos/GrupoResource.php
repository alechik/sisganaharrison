<?php

namespace App\Http\Resources\Grupos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GrupoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lote_id' => $this->lote_id,
            'lote_nombre' => $this->lote?->nombre,
            'lote_codigo' => $this->lote?->codigo,
            'nombre' => $this->nombre,
            'observaciones' => $this->observaciones,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
