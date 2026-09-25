<?php

namespace App\Http\Resources\Salidas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalidaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'fecha_salida' => $this->fecha_salida?->format('Y-m-d'),
            'estado' => $this->estado,
            'descuento' => $this->descuento !== null ? (float) $this->descuento : 0,
            'total_peso' => $this->total_peso !== null ? (float) $this->total_peso : null,
            'monto_total' => $this->monto_total !== null ? (float) $this->monto_total : 0,
            'cliente_id' => $this->cliente_id,
            'cliente_razon_social' => $this->whenLoaded(
                'cliente',
                fn () => $this->cliente?->razon_social
            ),
            'tipo_salida_id' => $this->tipo_salida_id,
            'tipo_salida_nombre' => $this->whenLoaded(
                'tipoSalida',
                fn () => $this->tipoSalida?->nombre
            ),
            'venta_id' => $this->venta_id,
            'cod_venta' => $this->whenLoaded(
                'venta',
                fn () => $this->venta?->cod_venta
            ),
            'user_id' => $this->user_id,
            'creador_nombre' => $this->whenLoaded(
                'creador',
                fn () => trim("{$this->creador->nombre} {$this->creador->apellido}")
            ),
            'cantidad_total' => $this->whenLoaded(
                'detalles',
                fn () => (int) $this->detalles->sum('cantidad')
            ),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $detalle->animal?->codigo,
                    'animal_arete' => $detalle->animal?->arete,
                    'sexo' => $detalle->animal?->sexo,
                    'categoria_codigo' => $detalle->animal?->categoria?->codigo,
                    'categoria_nombre' => $detalle->animal?->categoria?->nombre,
                    'lote_id' => $detalle->lote_id,
                    'lote_nombre' => $detalle->lote?->nombre ?? $detalle->animal?->lote?->nombre,
                    'potrero_nombre' => $detalle->lote?->potrero?->nombre
                        ?? $detalle->animal?->lote?->potrero?->nombre,
                    'cantidad' => $detalle->cantidad,
                    'peso' => (float) $detalle->peso,
                    'precio' => (float) $detalle->precio,
                    'descuento' => (float) $detalle->descuento,
                    'subtotal' => (float) $detalle->subtotal,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
