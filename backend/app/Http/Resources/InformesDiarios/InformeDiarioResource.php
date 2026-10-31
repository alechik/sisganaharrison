<?php

namespace App\Http\Resources\InformesDiarios;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InformeDiarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo_informe' => $this->codigo_informe,
            'detalle_informe' => $this->detalle_informe,
            'revisado' => $this->revisado,
            'fecha' => $this->fecha?->toDateString(),
            'fecha_revision' => $this->fecha_revision?->toDateString(),
            'user_trabajador_id' => $this->user_trabajador_id,
            'user_revisor_id' => $this->user_revisor_id,
            'trabajador' => $this->whenLoaded('trabajador', fn () => [
                'id' => $this->trabajador?->id,
                'nombre' => $this->trabajador?->nombre_completo,
            ]),
            'revisor' => $this->whenLoaded('revisor', fn () => $this->revisor ? [
                'id' => $this->revisor->id,
                'nombre' => $this->revisor->nombre_completo,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
