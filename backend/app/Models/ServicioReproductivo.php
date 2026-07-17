<?php

namespace App\Models;

use Database\Factories\ServicioReproductivoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public const RESULTADOS = [
        'PENDIENTE',
        'PRENADA',
        'VACIA',
        'ABORTO',
    ];

    protected $table = 'servicios_reproductivos';

    protected $fillable = [
        'hembra_id',
        'macho_id',
        'fecha_servicio',
        'tipo_servicio',
        'resultado',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha_servicio' => 'date',
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
}
