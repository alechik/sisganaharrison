<?php

namespace App\Http\Resources\EventosSanitarios;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventoSanitarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo_evento_id' => $this->tipo_evento_id,
            'tipo_evento_nombre' => $this->whenLoaded('tipoEvento', fn () => $this->tipoEvento?->nombre),
            'tipo_evento_codigo' => $this->whenLoaded('tipoEvento', fn () => $this->tipoEvento?->codigo),
            'user_id' => $this->user_id,
            'usuario_nombre' => $this->whenLoaded(
                'usuario',
                fn () => $this->usuario
                    ? trim("{$this->usuario->nombre} {$this->usuario->apellido}")
                    : null
            ),
            'fecha' => $this->fecha?->format('Y-m-d'),
            'diagnostico' => $this->diagnostico,
            'tratamiento' => $this->tratamiento,
            'total' => $this->total !== null ? (float) $this->total : 0,
            'observaciones' => $this->observaciones,
            'cantidad_animales' => $this->whenLoaded('detalles', fn () => $this->detalles->count()),
            'detalles' => $this->whenLoaded('detalles', function () {
                return $this->detalles->map(fn ($detalle) => [
                    'id' => $detalle->id,
                    'animal_id' => $detalle->animal_id,
                    'animal_codigo' => $detalle->animal?->codigo,
                    'animal_arete' => $detalle->animal?->arete,
                    'lote_id' => $detalle->lote_id,
                    'lote_nombre' => $detalle->lote?->nombre,
                    'medicamento_id' => $detalle->medicamento_id,
                    'medicamento_codigo' => $detalle->medicamento?->codigo,
                    'medicamento_nombre' => $detalle->medicamento?->nombre,
                    'presentacion_descripcion' => $detalle->medicamento?->presentacion?->descripcion,
                    'peso_animal' => (float) $detalle->peso_animal,
                    'precio_medicamento' => (float) $detalle->precio_medicamento,
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
