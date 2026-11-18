<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Línea de un pesaje: un animal identificado con su peso.
 *
 * @property int $id
 * @property int $pesaje_id
 * @property int $animal_id
 * @property int|null $potrero_id
 * @property string $peso
 */
class DetallePesaje extends Model
{
    protected $table = 'detalle_pesajes';

    protected $fillable = [
        'pesaje_id',
        'animal_id',
        'potrero_id',
        'peso',
    ];

    protected function casts(): array
    {
        return [
            'peso' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Pesaje, $this>
     */
    public function pesaje(): BelongsTo
    {
        return $this->belongsTo(Pesaje::class, 'pesaje_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'animal_id');
    }

    /**
     * @return BelongsTo<Potrero, $this>
     */
    public function potrero(): BelongsTo
    {
        return $this->belongsTo(Potrero::class, 'potrero_id');
    }
}
