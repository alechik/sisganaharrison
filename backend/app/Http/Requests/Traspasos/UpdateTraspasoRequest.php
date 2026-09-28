<?php

namespace App\Http\Requests\Traspasos;

class UpdateTraspasoRequest extends StoreTraspasoRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $traspaso = $this->route('traspaso');

        return $user?->can('update', $traspaso) ?? false;
    }
}
