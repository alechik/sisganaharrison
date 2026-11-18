<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Captura histórica de un animal en un evento sanitario.
 *
 * @property int $id
 * @property int $evento_sanitario_id
 * @property int $animal_id
 * @property int|null $potrero_id
 * @property int $producto_id
 * @property string $peso_animal
 * @property string $precio_producto
 */
class DetalleEventoSanitario extends Model
{
    protected $table = 'detalle_eventos_sanitarios';

    protected $fillable = [
        'evento_sanitario_id',
        'animal_id',
        'potrero_id',
        'producto_id',
        'almacen_id',
        'cantidad',
        'peso_animal',
        'precio_producto',
    ];

    protected function casts(): array
    {
        return [
            'peso_animal' => 'decimal:2',
            'precio_producto' => 'decimal:2',
            'cantidad' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<EventoSanitario, $this>
     */
    public function eventoSanitario(): BelongsTo
    {
        return $this->belongsTo(EventoSanitario::class, 'evento_sanitario_id');
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

    /**
     * @return BelongsTo<Producto, $this>
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    /**
     * @return BelongsTo<Almacen, $this>
     */
    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class, 'almacen_id');
    }
}
