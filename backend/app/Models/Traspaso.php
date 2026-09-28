<?php

namespace App\Models;

use Database\Factories\TraspasoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Traslado de animales entre lotes.
 *
 * @property int $id
 * @property int $user_id
 * @property int $lote_salida_id
 * @property int $lote_ingreso_id
 * @property \Illuminate\Support\Carbon $fecha_traspaso
 * @property string|null $observacion
 * @property string $total_peso
 * @property string $monto_total
 */
class Traspaso extends Model
{
    /** @use HasFactory<TraspasoFactory> */
    use HasFactory;

    protected $table = 'traspasos';

    protected $fillable = [
        'user_id',
        'lote_salida_id',
        'lote_ingreso_id',
        'fecha_traspaso',
        'observacion',
        'total_peso',
        'monto_total',
    ];

    protected function casts(): array
    {
        return [
            'fecha_traspaso' => 'date',
            'total_peso' => 'decimal:2',
            'monto_total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<Lote, $this>
     */
    public function loteSalida(): BelongsTo
    {
        return $this->belongsTo(Lote::class, 'lote_salida_id');
    }

    /**
     * @return BelongsTo<Lote, $this>
     */
    public function loteIngreso(): BelongsTo
    {
        return $this->belongsTo(Lote::class, 'lote_ingreso_id');
    }

    /**
     * @return HasMany<DetalleTraspaso, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleTraspaso::class, 'traspaso_id');
    }
}
