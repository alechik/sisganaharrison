<?php

namespace App\Http\Resources\Compras;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrdenCompraResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cod_compra' => $this->cod_compra,
            'fecha' => $this->fecha?->format('Y-m-d'),
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
            'autorizado_por' => $this->autorizado_por,
            'autorizador_nombre' => $this->whenLoaded(
                'autorizador',
                fn () => $this->autorizador
                    ? trim("{$this->autorizador->nombre} {$this->autorizador->apellido}")
                    : null
            ),
            'fecha_decision' => $this->fecha_decision?->toIso8601String(),
            'observacion_estado' => $this->observacion_estado,
            'cantidad_total' => $this->whenLoaded(
                'detalles',
                fn () => (int) $this->detalles->sum('cantidad')
            ),
            'cuarentena_id' => $this->whenLoaded(
                'cuarentena',
                fn () => $this->cuarentena?->id
            ),
            'cuarentena_estado' => $this->whenLoaded(
                'cuarentena',
                fn () => $this->cuarentena?->estado
            ),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'categoria_animal_id' => $detalle->categoria_animal_id,
                    'categoria_nombre' => $detalle->categoria?->nombre,
                    'categoria_codigo' => $detalle->categoria?->codigo,
                    'cantidad' => $detalle->cantidad,
                    'peso' => (float) $detalle->peso,
                    'edad' => $detalle->edad,
                    'precio' => (float) $detalle->precio,
                    'descuento' => (float) $detalle->descuento,
                    'subtotal' => (float) $detalle->subtotal,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $detalle->animal?->codigo,
                    'sexo' => $detalle->animal?->sexo,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
