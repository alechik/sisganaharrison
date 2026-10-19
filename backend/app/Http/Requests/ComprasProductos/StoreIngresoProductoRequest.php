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
            'orden_compra_id' => [
                'required',
                'integer',
                Rule::exists('orden_compras_productos', 'id')->where('estado', OrdenCompraProducto::ESTADO_AUTORIZADO),
            ],
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

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'orden_compra_id.exists' => 'Debe seleccionar una orden de compra de productos autorizada.',
        ];
    }
}
