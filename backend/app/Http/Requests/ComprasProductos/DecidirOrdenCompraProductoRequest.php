<?php

namespace App\Http\Requests\ComprasProductos;

use Illuminate\Foundation\Http\FormRequest;

class DecidirOrdenCompraProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras_productos.authorize') ?? false;
    }

    public function rules(): array
    {
        return [
            'observacion' => 'nullable|string|max:2000',
        ];
    }
}
