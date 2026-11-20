<?php

namespace App\Models;

use Database\Factories\CategoriaAnimalFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de categorías de animales del sistema.
 *
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $descripcion
 * @property string|null $sexo
 * @property int|null $edad_min_meses
 * @property int|null $edad_max_meses
 * @property bool|null $castrado
 * @property string|null $caracteristica
 * @property string|null $peso_min_kg
 * @property string|null $peso_max_kg
 * @property int|null $peso_referencia_meses
 * @property int|null $cambio_peso_meses
 * @property string|null $indice_aumento
 * @property bool $activo
 */
class CategoriaAnimal extends Model
{
    /** @use HasFactory<CategoriaAnimalFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'categorias_animales';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'sexo',
        'edad_min_meses',
        'edad_max_meses',
        'castrado',
        'caracteristica',
        'peso_min_kg',
        'peso_max_kg',
        'peso_referencia_meses',
        'cambio_peso_meses',
        'indice_aumento',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'castrado' => 'boolean',
            'edad_min_meses' => 'integer',
            'edad_max_meses' => 'integer',
            'peso_referencia_meses' => 'integer',
            'cambio_peso_meses' => 'integer',
            'peso_min_kg' => 'decimal:2',
            'peso_max_kg' => 'decimal:2',
            'indice_aumento' => 'decimal:2',
        ];
    }

    /**
     * @param  Builder<CategoriaAnimal>  $query
     * @return Builder<CategoriaAnimal>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * @return HasMany<DetalleOrdenCompra, $this>
     */
    public function detallesOrdenCompra(): HasMany
    {
        return $this->hasMany(DetalleOrdenCompra::class, 'categoria_animal_id');
    }

    /**
     * @return HasMany<CuarentenaDetalle, $this>
     */
    public function detallesCuarentena(): HasMany
    {
        return $this->hasMany(CuarentenaDetalle::class, 'categoria_animal_id');
    }
}
