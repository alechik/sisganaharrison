<?php

namespace App\Models;

use Database\Factories\PartoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Evento reproductivo de parto asociado a una gestación.
 *
 * @property int $id
 * @property int $gestacion_id
 * @property string $fecha_parto
 * @property string $estado
 * @property string|null $observaciones
 */
class Parto extends Model
{
    /** @use HasFactory<PartoFactory> */
    use HasFactory;

    public const ESTADO_PENDIENTE = 'PENDIENTE';

    public const ESTADO_FINALIZADA = 'FINALIZADA';

    public const ESTADOS = [
        self::ESTADO_PENDIENTE,
        self::ESTADO_FINALIZADA,
    ];

    protected $table = 'partos';

    protected $fillable = [
        'gestacion_id',
        'fecha_parto',
        'estado',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha_parto' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Gestacion, $this>
     */
    public function gestacion(): BelongsTo
    {
        return $this->belongsTo(Gestacion::class, 'gestacion_id');
    }

    /**
     * @return HasMany<Nacimiento, $this>
     */
    public function nacimientos(): HasMany
    {
        return $this->hasMany(Nacimiento::class, 'parto_id');
    }

    public function estaPendiente(): bool
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    public function estaFinalizado(): bool
    {
        return $this->estado === self::ESTADO_FINALIZADA;
    }
}
