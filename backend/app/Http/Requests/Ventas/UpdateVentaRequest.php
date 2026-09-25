<?php

namespace App\Http\Requests\Ventas;

class UpdateVentaRequest extends StoreVentaRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('ventas.update') ?? false;
    }
}
