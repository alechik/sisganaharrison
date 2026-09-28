<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Línea histórica de un animal en un traspaso.
 *
 * @property int $id
 * @property int $traspaso_id
 * @property int $animal_id
 * @property int $cantidad
 * @property string $peso
 * @property string $precio
 * @property string $subtotal
 */
class DetalleTraspaso extends Model
{
    protected $table = 'detalle_traspasos';

    protected $fillable = [
        'traspaso_id',
        'animal_id',
        'cantidad',
        'peso',
        'precio',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'peso' => 'decimal:2',
            'precio' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Traspaso, $this>
     */
    public function traspaso(): BelongsTo
    {
        return $this->belongsTo(Traspaso::class, 'traspaso_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'animal_id');
    }
}
