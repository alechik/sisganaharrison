<?php

namespace App\Models;

use Database\Factories\IngresoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Ingreso de animales al inventario desde una cuarentena completada.
 *
 * @property int $id
 * @property string $codigo
 * @property int $proveedor_id
 * @property int $user_id
 * @property int $cuarentena_id
 * @property int $lote_id
 * @property \Illuminate\Support\Carbon $fecha_ingreso
 * @property string $estado
 * @property string|null $observaciones
 * @property string $descuento
 * @property string|null $total_peso
 * @property string|null $monto_total
 */
class Ingreso extends Model
{
    /** @use HasFactory<IngresoFactory> */
    use HasFactory;

    public const ESTADO_REGISTRADO = 'REGISTRADO';

    protected $table = 'ingresos';

    protected $fillable = [
        'codigo',
        'proveedor_id',
        'user_id',
        'cuarentena_id',
        'lote_id',
        'fecha_ingreso',
        'estado',
        'observaciones',
        'descuento',
        'total_peso',
        'monto_total',
    ];

    protected function casts(): array
    {
        return [
            'fecha_ingreso' => 'date',
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
     * @return BelongsTo<Cuarentena, $this>
     */
    public function cuarentena(): BelongsTo
    {
        return $this->belongsTo(Cuarentena::class, 'cuarentena_id');
    }

    /**
     * @return BelongsTo<Lote, $this>
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class, 'lote_id');
    }

    /**
     * @return HasMany<DetalleIngreso, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleIngreso::class, 'ingreso_id');
    }
}
