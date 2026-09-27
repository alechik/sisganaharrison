<?php

namespace App\Http\Resources\Pesajes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PesajeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo_pesaje' => $this->codigo_pesaje,
            'fecha_pesaje' => $this->fecha_pesaje?->format('Y-m-d'),
            'total_peso' => $this->total_peso !== null ? (float) $this->total_peso : 0,
            'observacion' => $this->observacion,
            'user_id' => $this->user_id,
            'usuario_nombre' => $this->whenLoaded(
                'usuario',
                fn () => $this->usuario
                    ? trim("{$this->usuario->nombre} {$this->usuario->apellido}")
                    : null
            ),
            'cantidad_animales' => $this->whenLoaded(
                'detalles',
                fn () => $this->detalles->count()
            ),
            'es_nacimiento' => $this->esDeNacimiento(),
            'es_ingreso' => $this->esDeIngreso(),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $detalle->animal?->codigo,
                    'animal_arete' => $detalle->animal?->arete,
                    'lote_id' => $detalle->lote_id,
                    'lote_nombre' => $detalle->lote?->nombre ?? $detalle->animal?->lote?->nombre,
                    'potrero_nombre' => $detalle->lote?->potrero?->nombre
                        ?? $detalle->animal?->lote?->potrero?->nombre,
                    'peso' => (float) $detalle->peso,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
