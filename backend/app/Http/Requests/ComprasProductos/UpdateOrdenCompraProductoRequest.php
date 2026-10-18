<?php

namespace App\Http\Requests\ComprasProductos;

class UpdateOrdenCompraProductoRequest extends StoreOrdenCompraProductoRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras_productos.update') ?? false;
    }
}
