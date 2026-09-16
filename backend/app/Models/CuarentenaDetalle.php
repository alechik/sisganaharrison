<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Línea de detalle de una cuarentena.
 *
 * @property int $id
 * @property int $cuarentena_id
 * @property int|null $animal_id
 * @property int $categoria_animal_id
 * @property int $cantidad
 * @property string $peso
 * @property string $precio
 * @property string $descuento
 * @property string $estado
 * @property string $subtotal
 */
class CuarentenaDetalle extends Model
{
    protected $table = 'cuarentena_detalle';

    protected $fillable = [
        'cuarentena_id',
        'animal_id',
        'categoria_animal_id',
        'cantidad',
        'peso',
        'precio',
        'edad',
        'descuento',
        'estado',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'peso' => 'decimal:2',
            'precio' => 'decimal:2',
            'edad' => 'integer',
            'descuento' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Cuarentena, $this>
     */
    public function cuarentena(): BelongsTo
    {
        return $this->belongsTo(Cuarentena::class, 'cuarentena_id');
    }

    /**
     * @return BelongsTo<CategoriaAnimal, $this>
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaAnimal::class, 'categoria_animal_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'animal_id');
    }
}
