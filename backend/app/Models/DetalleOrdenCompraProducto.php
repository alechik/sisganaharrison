<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleOrdenCompraProducto extends Model
{
    protected $table = 'detalle_orden_compra_productos';

    protected $fillable = [
        'orden_compra_id',
        'producto_id',
        'cantidad',
        'precio',
        'descuento',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'precio' => 'decimal:2',
            'descuento' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<OrdenCompraProducto, $this>
     */
    public function orden(): BelongsTo
    {
        return $this->belongsTo(OrdenCompraProducto::class, 'orden_compra_id');
    }

    /**
     * @return BelongsTo<Producto, $this>
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
