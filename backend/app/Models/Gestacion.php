<?php

namespace App\Models;

use Database\Factories\GestacionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Seguimiento de gestación originada por un servicio reproductivo.
 *
 * @property int $id
 * @property int $servicio_id
 * @property string|null $fecha_confirmacion
 * @property string|null $fecha_probable_parto
 * @property string $estado
 * @property string|null $observaciones
 */
class Gestacion extends Model
{
    /** @use HasFactory<GestacionFactory> */
    use HasFactory;

    public const ESTADO_ACTIVA = 'ACTIVA';

    public const ESTADOS = [
        'ACTIVA',
        'FINALIZADA',
        'ABORTADA',
        'PERDIDA',
    ];

    protected $table = 'gestaciones';

    protected $fillable = [
        'servicio_id',
        'fecha_confirmacion',
        'fecha_probable_parto',
        'estado',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha_confirmacion' => 'date',
            'fecha_probable_parto' => 'date',
        ];
    }

    /**
     * @return BelongsTo<ServicioReproductivo, $this>
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(ServicioReproductivo::class, 'servicio_id');
    }

    public function esActiva(): bool
    {
        return $this->estado === self::ESTADO_ACTIVA;
    }
}
