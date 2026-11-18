<?php

namespace App\Models;

use Database\Factories\PresentacionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Forma farmacéutica de un producto.
 *
 * @property int $id
 * @property string $nombre
 */
class Presentacion extends Model
{
    /** @use HasFactory<PresentacionFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'presentaciones';

    protected $fillable = [
        'nombre',
    ];

    /**
     * @param  Builder<Presentacion>  $query
     * @return Builder<Presentacion>
     */
    public function scopeOrdenadas(Builder $query): Builder
    {
        return $query->orderBy('nombre');
    }

    /**
     * @return HasMany<Producto, $this>
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'presentacion_id');
    }
}
