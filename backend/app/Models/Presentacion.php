<?php

namespace App\Models;

use Database\Factories\PresentacionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Forma farmacéutica de un medicamento.
 *
 * @property int $id
 * @property string $descripcion
 */
class Presentacion extends Model
{
    /** @use HasFactory<PresentacionFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'presentaciones';

    protected $fillable = [
        'descripcion',
    ];

    /**
     * @param  Builder<Presentacion>  $query
     * @return Builder<Presentacion>
     */
    public function scopeOrdenadas(Builder $query): Builder
    {
        return $query->orderBy('descripcion');
    }

    /**
     * @return HasMany<Medicamento, $this>
     */
    public function medicamentos(): HasMany
    {
        return $this->hasMany(Medicamento::class, 'presentacion_id');
    }
}
