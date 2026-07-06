<?php

namespace App\Models;

use Database\Factories\TipoAlertaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de tipos de alertas automáticas del sistema.
 *
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $descripcion
 * @property bool $activo
 */
class TipoAlerta extends Model
{
    /** @use HasFactory<TipoAlertaFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'tipos_alertas';

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
     * @param  Builder<TipoAlerta>  $query
     * @return Builder<TipoAlerta>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
