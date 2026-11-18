<?php

namespace App\Models;

use Database\Factories\EstanciaFactory;
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
class Estancia extends Model
{
    /** @use HasFactory<EstanciaFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'estancias';

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
     * @param  Builder<Estancia>  $query
     * @return Builder<Estancia>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * @return HasMany<Parcela, $this>
     */
    public function parcelas(): HasMany
    {
        return $this->hasMany(Parcela::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne<Almacen, $this>
     */
    public function almacen(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Almacen::class);
    }
}
