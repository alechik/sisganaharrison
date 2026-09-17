<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Línea de un ingreso: un animal identificado.
 *
 * @property int $id
 * @property int $ingreso_id
 * @property int $animal_id
 * @property string|null $observaciones
 * @property string $peso_oc
 * @property string $peso_ingreso
 * @property string $precio_compra
 * @property int|null $edad
 */
class DetalleIngreso extends Model
{
    protected $table = 'detalle_ingresos';

    protected $fillable = [
        'ingreso_id',
        'animal_id',
        'observaciones',
        'peso_oc',
        'peso_ingreso',
        'precio_compra',
        'edad',
    ];

    protected function casts(): array
    {
        return [
            'peso_oc' => 'decimal:2',
            'peso_ingreso' => 'decimal:2',
            'precio_compra' => 'decimal:2',
            'edad' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Ingreso, $this>
     */
    public function ingreso(): BelongsTo
    {
        return $this->belongsTo(Ingreso::class, 'ingreso_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'animal_id');
    }
}
