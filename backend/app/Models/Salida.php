<?php

namespace App\Models;

use Database\Factories\SalidaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Salida de animales del inventario.
 *
 * @property int $id
 * @property int|null $cliente_id
 * @property int $user_id
 * @property int|null $venta_id
 * @property int $tipo_salida_id
 * @property string $codigo
 * @property \Illuminate\Support\Carbon $fecha_salida
 * @property string $estado
 * @property string $descuento
 * @property string|null $total_peso
 * @property string|null $monto_total
 */
class Salida extends Model
{
    /** @use HasFactory<SalidaFactory> */
    use HasFactory;

    public const ESTADO_REGISTRADO = 'REGISTRADO';

    protected $table = 'salidas';

    protected $fillable = [
        'cliente_id',
        'user_id',
        'venta_id',
        'tipo_salida_id',
        'codigo',
        'fecha_salida',
        'estado',
        'descuento',
        'total_peso',
        'monto_total',
    ];

    protected function casts(): array
    {
        return [
            'fecha_salida' => 'date',
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
     * @return BelongsTo<Venta, $this>
     */
    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    /**
     * @return BelongsTo<TipoSalida, $this>
     */
    public function tipoSalida(): BelongsTo
    {
        return $this->belongsTo(TipoSalida::class, 'tipo_salida_id');
    }

    /**
     * @return HasMany<DetalleSalida, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleSalida::class, 'salida_id');
    }
}
