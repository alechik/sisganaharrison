<?php

namespace App\Http\Requests\Gestaciones;

class UpdateGestacionRequest extends StoreGestacionRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reproduccion.update') ?? false;
    }
}
