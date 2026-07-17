<?php

namespace App\Models;

use Database\Factories\PesajeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Historial de peso del animal (append only).
 *
 * @property int $id
 * @property int $animal_id
 * @property string $fecha
 * @property string $peso
 * @property string|null $observaciones
 */
class Pesaje extends Model
{
    /** @use HasFactory<PesajeFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'pesajes';

    protected $fillable = [
        'animal_id',
        'fecha',
        'peso',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'peso' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }
}
