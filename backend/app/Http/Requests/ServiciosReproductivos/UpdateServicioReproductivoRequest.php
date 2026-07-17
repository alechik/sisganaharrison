<?php

namespace App\Http\Requests\ServiciosReproductivos;

class UpdateServicioReproductivoRequest extends StoreServicioReproductivoRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.update') ?? false;
    }
}
