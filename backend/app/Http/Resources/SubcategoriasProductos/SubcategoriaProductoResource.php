<?php

namespace App\Http\Resources\SubcategoriasProductos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubcategoriaProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'categoria_producto_id' => $this->categoria_producto_id,
            'categoria_nombre' => $this->whenLoaded('categoria', fn () => $this->categoria?->nombre),
            'nombre' => $this->nombre,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
