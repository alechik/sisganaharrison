<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IngresoProducto extends Model
{
    protected $table = 'ingreso_productos';

    protected $fillable = [
        'orden_compra_id',
        'proveedor_id',
        'almacen_id',
        'user_id',
        'cod_ingreso',
        'fecha',
        'descuento',
        'monto_total',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'descuento' => 'decimal:2',
            'monto_total' => 'decimal:2',
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
     * @return BelongsTo<Persona, $this>
     */
    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'proveedor_id');
    }

    /**
     * @return BelongsTo<Almacen, $this>
     */
    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<DetalleIngresoProducto, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleIngresoProducto::class, 'ingreso_producto_id');
    }
}
