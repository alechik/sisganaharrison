<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Línea de detalle de una orden de compra.
 *
 * @property int $id
 * @property int $orden_compra_id
 * @property int|null $animal_id
 * @property int $categoria_animal_id
 * @property int $cantidad
 * @property string $peso
 * @property string $precio
 * @property string $descuento
 * @property string $subtotal
 */
class DetalleOrdenCompra extends Model
{
    protected $table = 'detalle_orden_compra';

    protected $fillable = [
        'orden_compra_id',
        'animal_id',
        'categoria_animal_id',
        'cantidad',
        'peso',
        'precio',
        'edad',
        'descuento',
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
     * @return BelongsTo<OrdenCompra, $this>
     */
    public function ordenCompra(): BelongsTo
    {
        return $this->belongsTo(OrdenCompra::class, 'orden_compra_id');
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
