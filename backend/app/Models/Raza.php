<?php

namespace App\Models;

use Database\Factories\RazaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de razas bovinas del sistema.
 *
 * @property int $id
 * @property string $nombre
 * @property string $codigo
 * @property string|null $descripcion
 * @property bool $estado
 */
class Raza extends Model
{
    /** @use HasFactory<RazaFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
        ];
    }

    /**
     * @param  Builder<Raza>  $query
     * @return Builder<Raza>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('estado', true);
    }
}
