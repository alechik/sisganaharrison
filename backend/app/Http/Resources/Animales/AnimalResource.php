<?php

namespace App\Http\Resources\Animales;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'arete' => $this->arete,
            'nombre' => $this->nombre,
            'sexo' => $this->sexo,
            'fecha_nacimiento' => $this->fecha_nacimiento?->format('Y-m-d'),
            'raza_id' => $this->raza_id,
            'raza_nombre' => $this->raza?->nombre,
            'categoria_id' => $this->categoria_id,
            'categoria_codigo' => $this->categoria?->codigo,
            'categoria_nombre' => $this->categoria?->nombre,
            'estado_productivo_id' => $this->estado_productivo_id,
            'estado_productivo_nombre' => $this->estadoProductivo?->nombre,
            'lote_id' => $this->lote_id,
            'lote_nombre' => $this->lote?->nombre,
            'madre_id' => $this->madre_id,
            'madre_nombre' => $this->madre?->nombre ?? $this->madre?->codigo,
            'padre_id' => $this->padre_id,
            'padre_nombre' => $this->padre?->nombre ?? $this->padre?->codigo,
            'color' => $this->color,
            'observaciones' => $this->observaciones,
            'user_id' => $this->user_id,
            'edad_inicial' => $this->edad_inicial,
            'edad_actual' => $this->edad_actual,
            'precio_kilo' => $this->precio_kilo !== null ? (float) $this->precio_kilo : null,
            'estado' => $this->estado,
            'activo' => $this->estaActivo(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
