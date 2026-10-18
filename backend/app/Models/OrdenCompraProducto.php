<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrdenCompraProducto extends Model
{
    public const ESTADO_PENDIENTE = 'PENDIENTE';

    public const ESTADO_AUTORIZADO = 'AUTORIZADO';

    public const ESTADO_CANCELADO = 'CANCELADO';

    public const ESTADOS = [
        self::ESTADO_PENDIENTE,
        self::ESTADO_AUTORIZADO,
        self::ESTADO_CANCELADO,
    ];

    protected $table = 'orden_compras_productos';

    protected $fillable = [
        'proveedor_id',
        'user_id',
        'cod_compra',
        'fecha',
        'estado',
        'descuento',
        'monto_total',
        'autorizado_por',
        'fecha_decision',
        'observacion_estado',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'fecha_decision' => 'datetime',
            'descuento' => 'decimal:2',
            'monto_total' => 'decimal:2',
        ];
    }

    public function estaPendiente(): bool
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    public function estaAutorizada(): bool
    {
        return $this->estado === self::ESTADO_AUTORIZADO;
    }

    public function esModificable(): bool
    {
        return $this->estaPendiente();
    }

    /**
     * @return BelongsTo<Persona, $this>
     */
    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'proveedor_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function autorizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'autorizado_por');
    }

    /**
     * @return HasMany<DetalleOrdenCompraProducto, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleOrdenCompraProducto::class, 'orden_compra_id');
    }

    /**
     * @return HasMany<IngresoProducto, $this>
     */
    public function ingresos(): HasMany
    {
        return $this->hasMany(IngresoProducto::class, 'orden_compra_id');
    }
}
