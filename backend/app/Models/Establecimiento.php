<?php

namespace App\Models;

use Database\Factories\EstablecimientoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Unidad productiva o propiedad ganadera.
 *
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $propietario
 * @property string|null $telefono
 * @property string|null $direccion
 * @property string|null $municipio
 * @property string|null $departamento
 * @property string $pais
 * @property float|null $area_total_ha
 * @property string|null $descripcion
 * @property bool $activo
 */
class Establecimiento extends Model
{
    /** @use HasFactory<EstablecimientoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'establecimientos';

    protected $fillable = [
        'codigo',
        'nombre',
        'propietario',
        'telefono',
        'direccion',
        'municipio',
        'departamento',
        'pais',
        'area_total_ha',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'area_total_ha' => 'decimal:2',
        ];
    }

    /**
     * @param  Builder<Establecimiento>  $query
     * @return Builder<Establecimiento>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * @return HasMany<Potrero, $this>
     */
    public function potreros(): HasMany
    {
        return $this->hasMany(Potrero::class);
    }
}
