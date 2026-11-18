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
            'potrero_salida_id' => $this->potrero_salida_id,
            'potrero_salida_codigo' => $this->whenLoaded('potreroSalida', fn () => $this->potreroSalida?->codigo),
            'potrero_salida_nombre' => $this->whenLoaded('potreroSalida', fn () => $this->potreroSalida?->nombre),
            'potrero_ingreso_id' => $this->potrero_ingreso_id,
            'potrero_ingreso_codigo' => $this->whenLoaded('potreroIngreso', fn () => $this->potreroIngreso?->codigo),
            'potrero_ingreso_nombre' => $this->whenLoaded('potreroIngreso', fn () => $this->potreroIngreso?->nombre),
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
