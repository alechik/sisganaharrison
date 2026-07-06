<?php

namespace App\Models;

use Database\Factories\TipoMovimientoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de tipos de movimiento de animales.
 *
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $descripcion
 * @property bool $activo
 */
class TipoMovimiento extends Model
{
    /** @use HasFactory<TipoMovimientoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'tipos_movimientos';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * @param  Builder<TipoMovimiento>  $query
     * @return Builder<TipoMovimiento>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
