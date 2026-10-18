<?php

namespace App\Http\Resources\Inventario;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovimientoInventarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'almacen_id' => $this->almacen_id,
            'almacen_nombre' => $this->whenLoaded('almacen', fn () => $this->almacen?->nombre),
            'medicamento_id' => $this->medicamento_id,
            'producto_codigo' => $this->whenLoaded('medicamento', fn () => $this->medicamento?->codigo),
            'producto_nombre' => $this->whenLoaded('medicamento', fn () => $this->medicamento?->nombre),
            'tipo' => $this->tipo,
            'cantidad' => (float) $this->cantidad,
            'precio_unitario' => (float) $this->precio_unitario,
            'origen_type' => $this->origen_type,
            'origen_id' => $this->origen_id,
            'usuario_nombre' => $this->whenLoaded(
                'usuario',
                fn () => $this->usuario ? trim("{$this->usuario->nombre} {$this->usuario->apellido}") : null
            ),
            'observaciones' => $this->observaciones,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
