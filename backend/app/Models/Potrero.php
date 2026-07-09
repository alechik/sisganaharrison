<?php

namespace App\Models;

use Database\Factories\PotreroFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * División física del establecimiento destinada al pastoreo.
 *
 * @property int $id
 * @property int $establecimiento_id
 * @property string $codigo
 * @property string $nombre
 * @property float|null $area_ha
 * @property string|null $tipo_pasto
 * @property bool $disponibilidad
 * @property string|null $descripcion
 * @property bool $activo
 */
class Potrero extends Model
{
    /** @use HasFactory<PotreroFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'potreros';

    protected $fillable = [
        'establecimiento_id',
        'codigo',
        'nombre',
        'area_ha',
        'tipo_pasto',
        'disponibilidad',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'area_ha' => 'decimal:2',
            'disponibilidad' => 'boolean',
            'activo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Establecimiento, $this>
     */
    public function establecimiento(): BelongsTo
    {
        return $this->belongsTo(Establecimiento::class);
    }

    /**
     * @param  Builder<Potrero>  $query
     * @return Builder<Potrero>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
