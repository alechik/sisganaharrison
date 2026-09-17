<?php

namespace App\Models;

use Database\Factories\CuarentenaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Cuarentena de animales provenientes de una orden de compra o de una excepción directa.
 *
 * @property int $id
 * @property int $proveedor_id
 * @property int $user_id
 * @property int|null $orden_compra_id
 * @property string $cod_compra
 * @property string $origen
 * @property \Illuminate\Support\Carbon $fecha_inicio
 * @property \Illuminate\Support\Carbon|null $fecha_fin
 * @property string $estado
 * @property string $descuento
 * @property string|null $total_peso
 * @property string|null $monto_total
 */
class Cuarentena extends Model
{
    /** @use HasFactory<CuarentenaFactory> */
    use HasFactory;

    public const ESTADO_PROCESADO = 'PROCESADO';

    public const ESTADO_COMPLETADO = 'COMPLETADO';

    public const ORIGEN_ORDEN_COMPRA = 'ORDEN_COMPRA';

    public const ORIGEN_DIRECTA = 'DIRECTA';

    protected $table = 'cuarentenas';

    protected $fillable = [
        'proveedor_id',
        'user_id',
        'orden_compra_id',
        'cod_compra',
        'origen',
        'fecha_inicio',
        'fecha_fin',
        'estado',
        'descuento',
        'total_peso',
        'monto_total',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
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
     * @return BelongsTo<OrdenCompra, $this>
     */
    public function ordenCompra(): BelongsTo
    {
        return $this->belongsTo(OrdenCompra::class, 'orden_compra_id');
    }

    /**
     * @return HasMany<CuarentenaDetalle, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(CuarentenaDetalle::class, 'cuarentena_id');
    }

    /**
     * @return HasMany<Ingreso, $this>
     */
    public function ingresos(): HasMany
    {
        return $this->hasMany(Ingreso::class, 'cuarentena_id');
    }

    public function estaProcesada(): bool
    {
        return $this->estado === self::ESTADO_PROCESADO;
    }

    public function esModificable(): bool
    {
        return $this->estaProcesada();
    }

    public function esDirecta(): bool
    {
        return $this->origen === self::ORIGEN_DIRECTA;
    }

    public function estaCompletada(): bool
    {
        return $this->estado === self::ESTADO_COMPLETADO;
    }
}
