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
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
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
