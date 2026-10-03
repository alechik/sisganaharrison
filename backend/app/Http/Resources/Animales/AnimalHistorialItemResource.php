<?php

namespace App\Http\Resources\Animales;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimalHistorialItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $item */
        $item = is_array($this->resource) ? $this->resource : (array) $this->resource;

        return [
            'id' => $item['id'],
            'tipo' => $item['tipo'],
            'fecha' => $item['fecha'],
            'titulo' => $item['titulo'],
            'descripcion' => $item['descripcion'],
            'detalle' => $item['detalle'] ?? (object) [],
            'referencia' => $item['referencia'],
        ];
    }
}
