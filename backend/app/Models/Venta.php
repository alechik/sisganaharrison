<?php

namespace App\Models;

use Database\Factories\VentaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Venta de animales. La salida definitiva queda para el módulo de Salidas.
 *
 * @property int $id
 * @property int $cliente_id
 * @property int $user_id
 * @property string $cod_venta
 * @property \Illuminate\Support\Carbon $fecha_venta
 * @property string $estado
 * @property string $descuento
 * @property string|null $total_peso
 * @property string|null $monto_total
 * @property int|null $autorizado_por
 * @property \Illuminate\Support\Carbon|null $fecha_decision
 * @property string|null $observacion_estado
 */
class Venta extends Model
{
    /** @use HasFactory<VentaFactory> */
    use HasFactory;

    public const ESTADO_PENDIENTE = 'PENDIENTE';

    public const ESTADO_AUTORIZADA = 'AUTORIZADA';

    public const ESTADO_ANULADA = 'ANULADA';

    public const ESTADOS = [
        self::ESTADO_PENDIENTE,
        self::ESTADO_AUTORIZADA,
        self::ESTADO_ANULADA,
    ];

    protected $table = 'ventas';

    protected $fillable = [
        'cliente_id',
        'user_id',
        'cod_venta',
        'fecha_venta',
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
            'fecha_venta' => 'date',
            'fecha_decision' => 'datetime',
            'descuento' => 'decimal:2',
            'total_peso' => 'decimal:2',
            'monto_total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Persona, $this>
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'cliente_id');
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
     * @return HasMany<DetalleVenta, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'venta_id');
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
