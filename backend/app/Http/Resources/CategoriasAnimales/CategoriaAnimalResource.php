<?php

namespace App\Http\Resources\CategoriasAnimales;

use App\Support\CategoriaAnimalReglas;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoriaAnimalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $regla = CategoriaAnimalReglas::para($this->codigo) ?? CategoriaAnimalReglas::desdeModelo($this->resource);

        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'sexo' => $this->sexo,
            'edad_min_meses' => $this->edad_min_meses,
            'edad_max_meses' => $this->edad_max_meses,
            'castrado' => $this->castrado,
            'caracteristica' => $this->caracteristica,
            'peso_min_kg' => $this->peso_min_kg !== null ? (float) $this->peso_min_kg : null,
            'peso_max_kg' => $this->peso_max_kg !== null ? (float) $this->peso_max_kg : null,
            'peso_referencia_meses' => $this->peso_referencia_meses,
            'cambio_peso_meses' => $this->cambio_peso_meses,
            'indice_aumento' => $this->indice_aumento !== null ? (float) $this->indice_aumento : null,
            'regla' => $regla,
            'activo' => $this->activo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
