<?php

namespace App\Http\Resources\Productos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $presentacionNombre = $this->whenLoaded(
            'presentacion',
            fn () => $this->presentacion?->nombre
        );

        return [
            'id' => $this->id,
            'presentacion_id' => $this->presentacion_id,
            'presentacion_nombre' => $presentacionNombre,
            'presentacion_descripcion' => $presentacionNombre,
            'subcategoria_producto_id' => $this->subcategoria_producto_id,
            'subcategoria_nombre' => $this->whenLoaded('subcategoria', fn () => $this->subcategoria?->nombre),
            'categoria_producto_id' => $this->whenLoaded('subcategoria', fn () => $this->subcategoria?->categoria_producto_id),
            'categoria_producto_nombre' => $this->whenLoaded('subcategoria', fn () => $this->subcategoria?->categoria?->nombre),
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'nombre_cientifico' => $this->nombre_cientifico,
            'precio' => $this->precio !== null ? (float) $this->precio : 0,
            'cantidad_acumulada' => $this->cantidad_acumulada !== null ? (float) $this->cantidad_acumulada : 0,
            'descripcion' => $this->descripcion,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
