<?php

namespace App\Http\Resources\Salidas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimalDisponibleSalidaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $ultimoPesaje = $this->relationLoaded('detallesPesaje')
            ? $this->detallesPesaje->sortByDesc('id')->first()
            : null;
        $peso = $ultimoPesaje?->peso !== null ? (float) $ultimoPesaje->peso : $this->ultimoPeso();

        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'arete' => $this->arete,
            'sexo' => $this->sexo,
            'estado' => $this->estado,
            'edad_meses' => $this->calcularEdadMeses(),
            'categoria_id' => $this->categoria_id,
            'categoria_codigo' => $this->categoria?->codigo,
            'categoria_nombre' => $this->categoria?->nombre,
            'potrero_id' => $this->potrero_id,
            'potrero_nombre' => $this->potrero?->nombre,
            'grupo_id' => $this->grupo_id,
            'grupo_nombre' => $this->grupo?->nombre,
            'parcela_id' => $this->potrero?->parcela_id,
            'parcela_nombre' => $this->potrero?->parcela?->nombre,
            'peso' => $peso,
            'precio_kilo' => $this->precio_kilo !== null ? (float) $this->precio_kilo : null,
        ];
    }
}
