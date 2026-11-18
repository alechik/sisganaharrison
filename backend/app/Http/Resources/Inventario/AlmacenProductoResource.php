<?php

namespace App\Http\Resources\Inventario;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlmacenProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'almacen_id' => $this->almacen_id,
            'almacen_nombre' => $this->whenLoaded('almacen', fn () => $this->almacen?->nombre),
            'estancia_nombre' => $this->whenLoaded('almacen', fn () => $this->almacen?->estancia?->nombre),
            'producto_id' => $this->producto_id,
            'producto_codigo' => $this->whenLoaded('producto', fn () => $this->producto?->codigo),
            'producto_nombre' => $this->whenLoaded('producto', fn () => $this->producto?->nombre),
            'precio' => $this->whenLoaded('producto', fn () => $this->producto?->precio !== null ? (float) $this->producto->precio : 0),
            'categoria_nombre' => $this->whenLoaded('producto', fn () => $this->producto?->subcategoria?->categoria?->nombre),
            'subcategoria_nombre' => $this->whenLoaded('producto', fn () => $this->producto?->subcategoria?->nombre),
            'stock' => (float) $this->stock,
            'activo' => $this->activo,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
