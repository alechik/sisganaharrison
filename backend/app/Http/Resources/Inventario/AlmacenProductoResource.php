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
            'establecimiento_nombre' => $this->whenLoaded('almacen', fn () => $this->almacen?->establecimiento?->nombre),
            'medicamento_id' => $this->medicamento_id,
            'producto_codigo' => $this->whenLoaded('medicamento', fn () => $this->medicamento?->codigo),
            'producto_nombre' => $this->whenLoaded('medicamento', fn () => $this->medicamento?->nombre),
            'precio' => $this->whenLoaded('medicamento', fn () => $this->medicamento?->precio !== null ? (float) $this->medicamento->precio : 0),
            'categoria_nombre' => $this->whenLoaded('medicamento', fn () => $this->medicamento?->subcategoria?->categoria?->nombre),
            'subcategoria_nombre' => $this->whenLoaded('medicamento', fn () => $this->medicamento?->subcategoria?->nombre),
            'stock' => (float) $this->stock,
            'activo' => $this->activo,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
