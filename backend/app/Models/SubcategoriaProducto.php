<?php

namespace App\Models;

use Database\Factories\SubcategoriaProductoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubcategoriaProducto extends Model
{
    /** @use HasFactory<SubcategoriaProductoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'subcategorias_productos';

    protected $fillable = [
        'categoria_producto_id',
        'nombre',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * @param  Builder<SubcategoriaProducto>  $query
     * @return Builder<SubcategoriaProducto>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * @return BelongsTo<CategoriaProducto, $this>
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_producto_id');
    }

    /**
     * @return HasMany<Producto, $this>
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'subcategoria_producto_id');
    }
}
