<?php

namespace App\Http\Resources\ComprasProductos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IngresoProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orden_compra_id' => $this->orden_compra_id,
            'orden_cod_compra' => $this->whenLoaded('orden', fn () => $this->orden?->cod_compra),
            'cod_ingreso' => $this->cod_ingreso,
            'fecha' => $this->fecha?->format('Y-m-d'),
            'descuento' => (float) $this->descuento,
            'monto_total' => (float) $this->monto_total,
            'observaciones' => $this->observaciones,
            'proveedor_id' => $this->proveedor_id,
            'proveedor_razon_social' => $this->whenLoaded('proveedor', fn () => $this->proveedor?->razon_social),
            'proveedor_nit' => $this->whenLoaded('proveedor', fn () => $this->proveedor?->nit),
            'cantidad_total' => $this->whenLoaded('detalles', fn () => (int) $this->detalles->sum('cantidad')),
            'almacen_id' => $this->almacen_id,
            'almacen_nombre' => $this->whenLoaded('almacen', fn () => $this->almacen?->nombre),
            'creador_nombre' => $this->whenLoaded('creador', fn () => $this->creador ? trim("{$this->creador->nombre} {$this->creador->apellido}") : null),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'medicamento_id' => $detalle->medicamento_id,
                    'producto_codigo' => $detalle->medicamento?->codigo,
                    'producto_nombre' => $detalle->medicamento?->nombre,
                    'cantidad' => $detalle->cantidad,
                    'precio' => (float) $detalle->precio,
                    'descuento' => (float) $detalle->descuento,
                    'subtotal' => (float) $detalle->subtotal,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
