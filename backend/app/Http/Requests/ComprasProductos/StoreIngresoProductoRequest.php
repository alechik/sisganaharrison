<?php

namespace App\Http\Requests\ComprasProductos;

use App\Models\OrdenCompraProducto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIngresoProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('compras_productos.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'proveedor_id' => 'required|integer|exists:personas,id',
            'almacen_id' => 'required|integer|exists:almacenes,id',
            'fecha' => 'required|date',
            'descuento' => 'nullable|numeric|min:0',
            'observaciones' => 'nullable|string|max:2000',
            'orden_compra_id' => [
                'nullable',
                'integer',
                Rule::exists('orden_compras_productos', 'id')->where('estado', OrdenCompraProducto::ESTADO_AUTORIZADO),
            ],
            'detalles' => 'required|array|min:1',
            'detalles.*.medicamento_id' => 'required|integer|distinct|exists:medicamentos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio' => 'required|numeric|min:0',
            'detalles.*.descuento' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'proveedor_id.required' => 'Debe seleccionar un proveedor.',
            'almacen_id.required' => 'Debe seleccionar un almacén.',
            'detalles.required' => 'Debe ingresar al menos un producto.',
            'detalles.*.medicamento_id.distinct' => 'El producto no puede repetirse en el detalle.',
            'orden_compra_id.exists' => 'Si se asocia una orden, debe estar autorizada.',
        ];
    }
}
