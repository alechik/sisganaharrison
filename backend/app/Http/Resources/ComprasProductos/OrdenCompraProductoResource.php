<?php

namespace App\Http\Resources\ComprasProductos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrdenCompraProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cod_compra' => $this->cod_compra,
            'fecha' => $this->fecha?->format('Y-m-d'),
            'estado' => $this->estado,
            'descuento' => (float) $this->descuento,
            'monto_total' => (float) $this->monto_total,
            'cantidad_total' => $this->whenLoaded('detalles', fn () => (int) $this->detalles->sum('cantidad')),
            'proveedor_id' => $this->proveedor_id,
            'proveedor_razon_social' => $this->whenLoaded('proveedor', fn () => $this->proveedor?->razon_social),
            'proveedor_nit' => $this->whenLoaded('proveedor', fn () => $this->proveedor?->nit),
            'user_id' => $this->user_id,
            'creador_nombre' => $this->whenLoaded('creador', fn () => $this->creador ? trim("{$this->creador->nombre} {$this->creador->apellido}") : null),
            'autorizado_por' => $this->autorizado_por,
            'autorizador_nombre' => $this->whenLoaded('autorizador', fn () => $this->autorizador ? trim("{$this->autorizador->nombre} {$this->autorizador->apellido}") : null),
            'fecha_decision' => $this->fecha_decision?->toIso8601String(),
            'observacion_estado' => $this->observacion_estado,
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'medicamento_id' => $detalle->medicamento_id,
                    'producto_codigo' => $detalle->medicamento?->codigo,
                    'producto_nombre' => $detalle->medicamento?->nombre,
                    'cantidad' => $detalle->cantidad,
                    'cantidad_pendiente' => $detalle->cantidad_pendiente ?? null,
                    'precio' => (float) $detalle->precio,
                    'descuento' => (float) $detalle->descuento,
                    'subtotal' => (float) $detalle->subtotal,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
