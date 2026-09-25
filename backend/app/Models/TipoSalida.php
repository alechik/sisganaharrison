<?php

namespace App\Models;

use App\Models\Animal;
use Database\Factories\TipoSalidaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de tipos de salida de animales.
 *
 * @property int $id
 * @property string $nombre
 */
class TipoSalida extends Model
{
    /** @use HasFactory<TipoSalidaFactory> */
    use HasFactory, SoftDeletes;

    public const NOMBRE_VENTA = 'Venta';

    public const NOMBRE_PERDIDO = 'Perdido';

    public const NOMBRE_ROBO = 'Robo';

    public const NOMBRE_MUERTE = 'Muerte';

    protected $table = 'tipos_salidas';

    protected $fillable = [
        'nombre',
    ];

    /**
     * @param  Builder<TipoSalida>  $query
     * @return Builder<TipoSalida>
     */
    public function scopeOrdenados(Builder $query): Builder
    {
        return $query->orderBy('nombre');
    }

    /**
     * @return HasMany<Salida, $this>
     */
    public function salidas(): HasMany
    {
        return $this->hasMany(Salida::class, 'tipo_salida_id');
    }

    public function esVenta(): bool
    {
        return mb_strtolower($this->nombre) === mb_strtolower(self::NOMBRE_VENTA);
    }

    public function estadoAnimalResultante(): string
    {
        return match (mb_strtolower($this->nombre)) {
            mb_strtolower(self::NOMBRE_VENTA) => Animal::ESTADO_VENDIDO,
            mb_strtolower(self::NOMBRE_MUERTE) => Animal::ESTADO_MUERTO,
            mb_strtolower(self::NOMBRE_ROBO), mb_strtolower(self::NOMBRE_PERDIDO) => Animal::ESTADO_OTRO,
            default => Animal::ESTADO_OTRO,
        };
    }
}
