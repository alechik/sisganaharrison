<?php

namespace App\Http\Resources\Compras;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CuarentenaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cod_compra' => $this->cod_compra,
            'origen' => $this->origen,
            'fecha_inicio' => $this->fecha_inicio?->format('Y-m-d'),
            'fecha_fin' => $this->fecha_fin?->format('Y-m-d'),
            'estado' => $this->estado,
            'descuento' => $this->descuento !== null ? (float) $this->descuento : 0,
            'total_peso' => $this->total_peso !== null ? (float) $this->total_peso : null,
            'monto_total' => $this->monto_total !== null ? (float) $this->monto_total : 0,
            'proveedor_id' => $this->proveedor_id,
            'proveedor_razon_social' => $this->whenLoaded(
                'proveedor',
                fn () => $this->proveedor?->razon_social
            ),
            'proveedor_nit' => $this->whenLoaded(
                'proveedor',
                fn () => $this->proveedor?->nit
            ),
            'user_id' => $this->user_id,
            'creador_nombre' => $this->whenLoaded(
                'creador',
                fn () => trim("{$this->creador->nombre} {$this->creador->apellido}")
            ),
            'orden_compra_id' => $this->orden_compra_id,
            'orden_compra_codigo' => $this->whenLoaded(
                'ordenCompra',
                fn () => $this->ordenCompra?->cod_compra
            ),
            'cantidad_total' => $this->whenLoaded(
                'detalles',
                fn () => (int) $this->detalles->sum('cantidad')
            ),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'categoria_animal_id' => $detalle->categoria_animal_id,
                    'categoria_nombre' => $detalle->categoria?->nombre,
                    'categoria_codigo' => $detalle->categoria?->codigo,
                    'cantidad' => $detalle->cantidad,
                    'peso' => (float) $detalle->peso,
                    'precio' => (float) $detalle->precio,
                    'descuento' => (float) $detalle->descuento,
                    'estado' => $detalle->estado,
                    'subtotal' => (float) $detalle->subtotal,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $detalle->animal?->codigo,
                    'animal_arete' => $detalle->animal?->arete,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
