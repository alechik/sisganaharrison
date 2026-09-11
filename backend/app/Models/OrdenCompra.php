<?php

namespace App\Models;

use Database\Factories\OrdenCompraFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Orden de compra de animales por categoría.
 *
 * @property int $id
 * @property int $proveedor_id
 * @property int $user_id
 * @property string $cod_compra
 * @property \Illuminate\Support\Carbon $fecha
 * @property string $estado
 * @property string $descuento
 * @property string|null $total_peso
 * @property string|null $monto_total
 * @property int|null $autorizado_por
 * @property \Illuminate\Support\Carbon|null $fecha_decision
 * @property string|null $observacion_estado
 */
class OrdenCompra extends Model
{
    /** @use HasFactory<OrdenCompraFactory> */
    use HasFactory;

    public const ESTADO_PENDIENTE = 'PENDIENTE';

    public const ESTADO_AUTORIZADA = 'AUTORIZADA';

    public const ESTADO_RECHAZADA = 'RECHAZADA';

    public const ESTADOS = [
        self::ESTADO_PENDIENTE,
        self::ESTADO_AUTORIZADA,
        self::ESTADO_RECHAZADA,
    ];

    protected $table = 'orden_compras';

    protected $fillable = [
        'proveedor_id',
        'user_id',
        'cod_compra',
        'fecha',
        'estado',
        'descuento',
        'total_peso',
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
            'total_peso' => 'decimal:2',
            'monto_total' => 'decimal:2',
        ];
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
     * @return HasMany<DetalleOrdenCompra, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleOrdenCompra::class, 'orden_compra_id');
    }

    public function estaPendiente(): bool
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    public function esModificable(): bool
    {
        return $this->estaPendiente();
    }
}
