<?php

namespace App\Models;

use Database\Factories\TipoIngresoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de tipos de ingreso físico de animales.
 *
 * @property int $id
 * @property string $nombre
 * @property string $codigo
 * @property string $iniciales
 * @property string|null $descripcion
 * @property bool $requiere_proveedor
 * @property bool $estado
 */
class TipoIngreso extends Model
{
    /** @use HasFactory<TipoIngresoFactory> */
    use HasFactory, SoftDeletes;

    public const CODIGO_COMPRA = 'COMPRA';

    protected $table = 'tipos_ingresos';

    protected $fillable = [
        'nombre',
        'codigo',
        'iniciales',
        'descripcion',
        'requiere_proveedor',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'requiere_proveedor' => 'boolean',
            'estado' => 'boolean',
        ];
    }

    /**
     * @param  Builder<TipoIngreso>  $query
     * @return Builder<TipoIngreso>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('estado', true);
    }

    /**
     * @return HasMany<Ingreso, $this>
     */
    public function ingresos(): HasMany
    {
        return $this->hasMany(Ingreso::class, 'tipo_ingreso_id');
    }

    public function prefijoCodigo(): string
    {
        $iniciales = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', $this->iniciales));

        return 'IN'.$iniciales;
    }

    public function esCompra(): bool
    {
        return strtoupper($this->codigo) === self::CODIGO_COMPRA || $this->requiere_proveedor;
    }
}
