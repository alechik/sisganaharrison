<?php

namespace App\Models;

use Database\Factories\ProductoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de productos (incluye vacunas e insumos de reproducción).
 *
 * @property int $id
 * @property int $presentacion_id
 * @property int $subcategoria_producto_id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $nombre_cientifico
 * @property string $precio
 * @property string $descripcion
 * @property bool $activo
 */
class Producto extends Model
{
    /** @use HasFactory<ProductoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'productos';

    protected $fillable = [
        'presentacion_id',
        'subcategoria_producto_id',
        'codigo',
        'nombre',
        'nombre_cientifico',
        'precio',
        'cantidad_acumulada',
        'valor_acumulado',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'cantidad_acumulada' => 'decimal:2',
            'valor_acumulado' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    /**
     * @param  Builder<Producto>  $query
     * @return Builder<Producto>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * @return BelongsTo<Presentacion, $this>
     */
    public function presentacion(): BelongsTo
    {
        return $this->belongsTo(Presentacion::class, 'presentacion_id');
    }

    /**
     * @return BelongsTo<SubcategoriaProducto, $this>
     */
    public function subcategoria(): BelongsTo
    {
        return $this->belongsTo(SubcategoriaProducto::class, 'subcategoria_producto_id');
    }

    /**
     * @return HasMany<DetalleEventoSanitario, $this>
     */
    public function detallesEvento(): HasMany
    {
        return $this->hasMany(DetalleEventoSanitario::class, 'producto_id');
    }
}
