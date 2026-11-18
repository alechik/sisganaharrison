<?php

namespace App\Models;

use Database\Factories\ParcelaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * División física de la estancia destinada al pastoreo.
 *
 * @property int $id
 * @property int $estancia_id
 * @property string $codigo
 * @property string $nombre
 * @property float|null $area_ha
 * @property string|null $tipo_pasto
 * @property bool $disponibilidad
 * @property string|null $descripcion
 * @property bool $activo
 */
class Parcela extends Model
{
    /** @use HasFactory<ParcelaFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'parcelas';

    protected $fillable = [
        'estancia_id',
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
     * @return BelongsTo<Estancia, $this>
     */
    public function estancia(): BelongsTo
    {
        return $this->belongsTo(Estancia::class);
    }

    /**
     * @return HasMany<Potrero, $this>
     */
    public function potreros(): HasMany
    {
        return $this->hasMany(Potrero::class);
    }

    /**
     * @param  Builder<Parcela>  $query
     * @return Builder<Parcela>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
