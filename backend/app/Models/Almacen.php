<?php

namespace App\Models;

use Database\Factories\AlmacenFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Almacen extends Model
{
    /** @use HasFactory<AlmacenFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'almacenes';

    protected $fillable = [
        'establecimiento_id',
        'nombre',
        'direccion',
        'observacion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * @param  Builder<Almacen>  $query
     * @return Builder<Almacen>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * @return BelongsTo<Establecimiento, $this>
     */
    public function establecimiento(): BelongsTo
    {
        return $this->belongsTo(Establecimiento::class);
    }

    /**
     * @return HasMany<AlmacenProducto, $this>
     */
    public function existencias(): HasMany
    {
        return $this->hasMany(AlmacenProducto::class, 'almacen_id');
    }
}
