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
 * @property string $codigo
 * @property string $iniciales
 * @property string|null $descripcion
 * @property bool $requiere_cliente
 * @property bool $estado
 */
class TipoSalida extends Model
{
    /** @use HasFactory<TipoSalidaFactory> */
    use HasFactory, SoftDeletes;

    public const NOMBRE_VENTA = 'Venta';

    public const NOMBRE_PERDIDO = 'Pérdida';

    public const NOMBRE_ROBO = 'Robo';

    public const NOMBRE_MUERTE = 'Muerte';

    public const CODIGO_VENTA = 'VENTA';

    public const CODIGO_PERDIDA = 'PERDIDA';

    public const CODIGO_ROBO = 'ROBO';

    public const CODIGO_MUERTE = 'MUERTE';

    protected $table = 'tipos_salidas';

    protected $fillable = [
        'nombre',
        'codigo',
        'iniciales',
        'descripcion',
        'requiere_cliente',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'requiere_cliente' => 'boolean',
            'estado' => 'boolean',
        ];
    }

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
        return strtoupper((string) $this->codigo) === self::CODIGO_VENTA
            || mb_strtolower((string) $this->nombre) === mb_strtolower(self::NOMBRE_VENTA);
    }

    public function prefijoCodigo(): string
    {
        $iniciales = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', $this->iniciales));

        return 'S'.$iniciales;
    }

    public function estadoAnimalResultante(): string
    {
        $codigo = strtoupper((string) $this->codigo);
        $nombre = mb_strtolower((string) $this->nombre);

        return match (true) {
            $codigo === self::CODIGO_VENTA, $nombre === mb_strtolower(self::NOMBRE_VENTA) => Animal::ESTADO_VENDIDO,
            $codigo === self::CODIGO_MUERTE, $nombre === mb_strtolower(self::NOMBRE_MUERTE) => Animal::ESTADO_MUERTO,
            $codigo === self::CODIGO_ROBO,
            $codigo === self::CODIGO_PERDIDA,
            $nombre === mb_strtolower(self::NOMBRE_ROBO),
            $nombre === mb_strtolower(self::NOMBRE_PERDIDO),
            $nombre === 'perdido' => Animal::ESTADO_OTRO,
            default => Animal::ESTADO_OTRO,
        };
    }
}
