<?php

namespace App\Models;

use Database\Factories\ServicioReproductivoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Registro de servicio reproductivo entre hembra y macho.
 *
 * @property int $id
 * @property int $hembra_id
 * @property int|null $macho_id
 * @property string $fecha_servicio
 * @property string $tipo_servicio
 * @property string|null $resultado
 * @property string|null $observaciones
 */
class ServicioReproductivo extends Model
{
    /** @use HasFactory<ServicioReproductivoFactory> */
    use HasFactory;

    public const TIPOS_SERVICIO = [
        'MONTA_NATURAL',
        'INSEMINACION_ARTIFICIAL',
        'TRANSFERENCIA_EMBRION',
    ];

    public const RESULTADO_PENDIENTE = 'PENDIENTE';

    public const RESULTADO_PRENADA = 'PRENADA';

    public const RESULTADOS = [
        self::RESULTADO_PENDIENTE,
        self::RESULTADO_PRENADA,
        'VACIA',
        'ABORTO',
    ];

    protected $table = 'servicios_reproductivos';

    protected $fillable = [
        'hembra_id',
        'macho_id',
        'user_id',
        'codigo_servicio',
        'fecha_servicio',
        'tipo_servicio',
        'resultado',
        'observaciones',
        'total',
        'inventario_aplicado_at',
    ];

    protected function casts(): array
    {
        return [
            'fecha_servicio' => 'date',
            'total' => 'decimal:2',
            'inventario_aplicado_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function hembra(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'hembra_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function macho(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'macho_id');
    }

    /**
     * @return HasOne<Gestacion, $this>
     */
    public function gestacion(): HasOne
    {
        return $this->hasOne(Gestacion::class, 'servicio_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<ProductoServicio, $this>
     */
    public function insumos(): HasMany
    {
        return $this->hasMany(ProductoServicio::class, 'servicio_id');
    }

    public function debeConsumirInventario(): bool
    {
        return $this->resultado !== null && $this->resultado !== self::RESULTADO_PENDIENTE;
    }
}
