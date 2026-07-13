<?php

namespace App\Models;

use Database\Factories\LoteFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Unidad operativa donde se agrupan animales.
 *
 * @property int $id
 * @property int $potrero_id
 * @property string $codigo
 * @property string $nombre
 * @property int $capacidad_animales
 * @property float|null $area_ha
 * @property string|null $observaciones
 * @property bool $activo
 */
class Lote extends Model
{
    /** @use HasFactory<LoteFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'lotes';

    protected $fillable = [
        'potrero_id',
        'codigo',
        'nombre',
        'capacidad_animales',
        'area_ha',
        'observaciones',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'capacidad_animales' => 'integer',
            'area_ha' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Potrero, $this>
     */
    public function potrero(): BelongsTo
    {
        return $this->belongsTo(Potrero::class);
    }

    /**
     * @return HasMany<Animal, $this>
     */
    public function animales(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    /**
     * @param  Builder<Lote>  $query
     * @return Builder<Lote>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
