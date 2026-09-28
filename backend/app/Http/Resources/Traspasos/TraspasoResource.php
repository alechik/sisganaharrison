<?php

namespace App\Http\Resources\Traspasos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TraspasoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'usuario_nombre' => $this->whenLoaded(
                'usuario',
                fn () => $this->usuario
                    ? trim("{$this->usuario->nombre} {$this->usuario->apellido}")
                    : null
            ),
            'lote_salida_id' => $this->lote_salida_id,
            'lote_salida_codigo' => $this->whenLoaded('loteSalida', fn () => $this->loteSalida?->codigo),
            'lote_salida_nombre' => $this->whenLoaded('loteSalida', fn () => $this->loteSalida?->nombre),
            'lote_ingreso_id' => $this->lote_ingreso_id,
            'lote_ingreso_codigo' => $this->whenLoaded('loteIngreso', fn () => $this->loteIngreso?->codigo),
            'lote_ingreso_nombre' => $this->whenLoaded('loteIngreso', fn () => $this->loteIngreso?->nombre),
            'fecha_traspaso' => $this->fecha_traspaso?->format('Y-m-d'),
            'observacion' => $this->observacion,
            'total_peso' => $this->total_peso !== null ? (float) $this->total_peso : 0,
            'monto_total' => $this->monto_total !== null ? (float) $this->monto_total : 0,
            'cantidad_animales' => $this->whenLoaded('detalles', fn () => $this->detalles->count()),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $detalle->animal?->codigo,
                    'animal_arete' => $detalle->animal?->arete,
                    'sexo' => $detalle->animal?->sexo,
                    'categoria_codigo' => $detalle->animal?->categoria?->codigo,
                    'categoria_nombre' => $detalle->animal?->categoria?->nombre,
                    'cantidad' => (int) $detalle->cantidad,
                    'peso' => (float) $detalle->peso,
                    'precio' => (float) $detalle->precio,
                    'subtotal' => (float) $detalle->subtotal,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
