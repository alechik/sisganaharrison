<?php

namespace App\Models;

use Database\Factories\EstadoProductivoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de estados productivos del animal.
 *
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $descripcion
 * @property bool $activo
 */
class EstadoProductivo extends Model
{
    /** @use HasFactory<EstadoProductivoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'estados_productivos';

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
     * @param  Builder<EstadoProductivo>  $query
     * @return Builder<EstadoProductivo>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
