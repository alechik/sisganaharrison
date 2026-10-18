<?php

namespace App\Http\Requests\ComprasProductos;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrdenCompraProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras_productos.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'proveedor_id' => 'required|integer|exists:personas,id',
            'fecha' => 'required|date',
            'descuento' => 'nullable|numeric|min:0',
            'detalles' => 'required|array|min:1',
            'detalles.*.medicamento_id' => 'required|integer|distinct|exists:medicamentos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio' => 'required|numeric|min:0',
            'detalles.*.descuento' => 'nullable|numeric|min:0',
        ];
    }
}
