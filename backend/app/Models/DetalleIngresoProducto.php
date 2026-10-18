<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleIngresoProducto extends Model
{
    protected $table = 'detalle_ingreso_productos';

    protected $fillable = [
        'ingreso_producto_id',
        'medicamento_id',
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
     * @return BelongsTo<IngresoProducto, $this>
     */
    public function ingreso(): BelongsTo
    {
        return $this->belongsTo(IngresoProducto::class, 'ingreso_producto_id');
    }

    /**
     * @return BelongsTo<Medicamento, $this>
     */
    public function medicamento(): BelongsTo
    {
        return $this->belongsTo(Medicamento::class);
    }
}
