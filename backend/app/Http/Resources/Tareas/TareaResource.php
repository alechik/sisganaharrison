<?php

namespace App\Http\Resources\Tareas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TareaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $gestor = $request->user()?->hasAnyRole(['administrador', 'gerencia']) ?? false;

        return [
            'id' => $this->id,
            'codigo_tarea' => $this->codigo_tarea,
            'indicacion' => $this->indicacion,
            'respuesta_indicacion' => $this->respuesta_indicacion,
            'estado' => $this->estado,
            'fecha_inicio' => $this->fecha_inicio?->toIso8601String(),
            'fecha_fin' => $this->fecha_fin?->toIso8601String(),
            'vista' => $this->when($gestor, $this->visto),
            'user_gerencia_id' => $this->user_gerencia_id,
            'user_trabajador_id' => $this->user_trabajador_id,
            'gerencia' => $this->whenLoaded('gerencia', fn () => [
                'id' => $this->gerencia?->id,
                'nombre' => $this->gerencia?->nombre_completo,
            ]),
            'trabajador' => $this->whenLoaded('trabajador', fn () => [
                'id' => $this->trabajador?->id,
                'nombre' => $this->trabajador?->nombre_completo,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
