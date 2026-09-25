<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Línea de detalle de una salida: un animal identificado.
 *
 * @property int $id
 * @property int $salida_id
 * @property int $animal_id
 * @property int $cantidad
 * @property string $peso
 * @property int|null $lote_id
 * @property string $precio
 * @property string $descuento
 * @property string $subtotal
 */
class DetalleSalida extends Model
{
    protected $table = 'detalle_salidas';

    protected $fillable = [
        'salida_id',
        'animal_id',
        'cantidad',
        'peso',
        'lote_id',
        'precio',
        'descuento',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'peso' => 'decimal:2',
            'precio' => 'decimal:2',
            'descuento' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Salida, $this>
     */
    public function salida(): BelongsTo
    {
        return $this->belongsTo(Salida::class, 'salida_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'animal_id');
    }

    /**
     * @return BelongsTo<Lote, $this>
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class, 'lote_id');
    }
}
