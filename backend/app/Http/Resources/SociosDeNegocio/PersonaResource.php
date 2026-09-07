<?php

namespace App\Http\Resources\SociosDeNegocio;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'razon_social' => $this->razon_social,
            'responsable' => $this->responsable,
            'email' => $this->email,
            'fecha_nacimiento' => $this->fecha_nacimiento?->format('Y-m-d'),
            'ci' => $this->ci,
            'nit' => $this->nit,
            'celular' => $this->celular,
            'estado_civil' => $this->estado_civil,
            'sexo' => $this->sexo,
            'direccion' => $this->direccion,
            'estado' => $this->estado,
            'fecha_reg' => $this->fecha_reg?->format('Y-m-d'),
            'user_id' => $this->user_id,
            'registrado_por_nombre' => $this->whenLoaded(
                'registradoPor',
                fn () => trim("{$this->registradoPor->nombre} {$this->registradoPor->apellido}")
            ),
            'tipos' => $this->whenLoaded(
                'tipos',
                fn () => $this->tipos->map(fn ($tipo) => [
                    'id' => $tipo->id,
                    'nombre' => $tipo->nombre,
                ])->values()
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
