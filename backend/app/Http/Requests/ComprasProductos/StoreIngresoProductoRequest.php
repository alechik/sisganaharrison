<?php

namespace App\Http\Requests\ComprasProductos;

use Illuminate\Foundation\Http\FormRequest;

class StoreIngresoProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras_productos.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'orden_compra_id' => 'required|integer|exists:orden_compras_productos,id',
            'almacen_id' => 'required|integer|exists:almacenes,id',
            'fecha' => 'required|date',
            'descuento' => 'nullable|numeric|min:0',
            'observaciones' => 'nullable|string|max:2000',
            'detalles' => 'required|array|min:1',
            'detalles.*.medicamento_id' => 'required|integer|distinct|exists:medicamentos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio' => 'nullable|numeric|min:0',
            'detalles.*.descuento' => 'nullable|numeric|min:0',
        ];
    }
}
