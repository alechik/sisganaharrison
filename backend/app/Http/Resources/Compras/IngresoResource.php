<?php

namespace App\Http\Resources\Compras;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IngresoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'fecha_ingreso' => $this->fecha_ingreso?->format('Y-m-d'),
            'estado' => $this->estado,
            'observaciones' => $this->observaciones,
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
            'cuarentena_id' => $this->cuarentena_id,
            'cuarentena_codigo' => $this->whenLoaded(
                'cuarentena',
                fn () => $this->cuarentena?->cod_compra
            ),
            'lote_id' => $this->lote_id,
            'lote_nombre' => $this->whenLoaded(
                'lote',
                fn () => $this->lote?->nombre
            ),
            'lote_codigo' => $this->whenLoaded(
                'lote',
                fn () => $this->lote?->codigo
            ),
            'cantidad_total' => $this->whenLoaded(
                'detalles',
                fn () => $this->detalles->count()
            ),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $detalle->animal?->codigo,
                    'sexo' => $detalle->animal?->sexo,
                    'categoria_codigo' => $detalle->animal?->categoria?->codigo,
                    'categoria_nombre' => $detalle->animal?->categoria?->nombre,
                    'edad' => $detalle->edad,
                    'peso_oc' => (float) $detalle->peso_oc,
                    'peso_ingreso' => (float) $detalle->peso_ingreso,
                    'precio_compra' => (float) $detalle->precio_compra,
                    'observaciones' => $detalle->observaciones,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
