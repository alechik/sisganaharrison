<?php

namespace App\Http\Resources\Medicamentos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicamentoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'presentacion_id' => $this->presentacion_id,
            'presentacion_descripcion' => $this->whenLoaded(
                'presentacion',
                fn () => $this->presentacion?->descripcion
            ),
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'laboratorio' => $this->laboratorio,
            'precio' => $this->precio !== null ? (float) $this->precio : 0,
            'descripcion' => $this->descripcion,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
