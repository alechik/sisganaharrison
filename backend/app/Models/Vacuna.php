<?php

namespace App\Models;

use Database\Factories\VacunaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo oficial de vacunas.
 *
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $laboratorio
 * @property string|null $descripcion
 * @property bool $activo
 */
class Vacuna extends Model
{
    /** @use HasFactory<VacunaFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'vacunas';

    protected $fillable = [
        'codigo',
        'nombre',
        'laboratorio',
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
     * @param  Builder<Vacuna>  $query
     * @return Builder<Vacuna>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
