<?php

namespace App\Http\Resources\Ventas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimalDisponibleVentaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $ultimoPesaje = $this->relationLoaded('pesajes')
            ? $this->pesajes->first()
            : null;

        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'arete' => $this->arete,
            'sexo' => $this->sexo,
            'estado' => $this->estado,
            'categoria_id' => $this->categoria_id,
            'categoria_codigo' => $this->categoria?->codigo,
            'categoria_nombre' => $this->categoria?->nombre,
            'lote_id' => $this->lote_id,
            'lote_nombre' => $this->lote?->nombre,
            'potrero_id' => $this->lote?->potrero_id,
            'potrero_nombre' => $this->lote?->potrero?->nombre,
            'peso' => $ultimoPesaje?->peso !== null ? (float) $ultimoPesaje->peso : null,
            'precio_kilo' => $this->precio_kilo !== null ? (float) $this->precio_kilo : null,
        ];
    }
}
