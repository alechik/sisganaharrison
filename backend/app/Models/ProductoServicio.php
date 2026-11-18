<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoServicio extends Model
{
    protected $table = 'producto_servicio';

    protected $fillable = [
        'servicio_id',
        'producto_id',
        'almacen_id',
        'precio',
        'cantidad',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'cantidad' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ServicioReproductivo, $this>
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(ServicioReproductivo::class, 'servicio_id');
    }

    /**
     * @return BelongsTo<Producto, $this>
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    /**
     * @return BelongsTo<Almacen, $this>
     */
    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }
}
