<?php

namespace App\Http\Resources\ServiciosReproductivos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicioReproductivoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo_servicio' => $this->codigo_servicio,
            'user_id' => $this->user_id,
            'usuario_nombre' => $this->whenLoaded(
                'usuario',
                fn () => $this->usuario ? trim("{$this->usuario->nombre} {$this->usuario->apellido}") : null
            ),
            'hembra_id' => $this->hembra_id,
            'hembra_codigo' => $this->whenLoaded('hembra', fn () => $this->hembra->codigo),
            'hembra_arete' => $this->whenLoaded('hembra', fn () => $this->hembra->arete),
            'macho_id' => $this->macho_id,
            'macho_codigo' => $this->whenLoaded('macho', fn () => $this->macho?->codigo),
            'macho_arete' => $this->whenLoaded('macho', fn () => $this->macho?->arete),
            'fecha_servicio' => $this->fecha_servicio?->format('Y-m-d'),
            'tipo_servicio' => $this->tipo_servicio,
            'resultado' => $this->resultado,
            'observaciones' => $this->observaciones,
            'total' => $this->total !== null ? (float) $this->total : 0,
            'inventario_aplicado_at' => $this->inventario_aplicado_at?->toIso8601String(),
            'insumos' => $this->whenLoaded('insumos', function () {
                return $this->insumos->map(fn ($insumo) => [
                    'id' => $insumo->id,
                    'medicamento_id' => $insumo->medicamento_id,
                    'producto_codigo' => $insumo->medicamento?->codigo,
                    'producto_nombre' => $insumo->medicamento?->nombre,
                    'almacen_id' => $insumo->almacen_id,
                    'almacen_nombre' => $insumo->almacen?->nombre,
                    'precio' => (float) $insumo->precio,
                    'cantidad' => $insumo->cantidad,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
