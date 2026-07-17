<?php

namespace App\Models;

use Database\Factories\EventoSanitarioFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registro sanitario del animal (append only).
 *
 * @property int $id
 * @property int $animal_id
 * @property int $tipo_evento_id
 * @property int|null $vacuna_id
 * @property string $fecha
 * @property string|null $diagnostico
 * @property string|null $tratamiento
 * @property string|null $observaciones
 */
class EventoSanitario extends Model
{
    /** @use HasFactory<EventoSanitarioFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'eventos_sanitarios';

    protected $fillable = [
        'animal_id',
        'tipo_evento_id',
        'vacuna_id',
        'fecha',
        'diagnostico',
        'tratamiento',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * @return BelongsTo<TipoEventoSanitario, $this>
     */
    public function tipoEvento(): BelongsTo
    {
        return $this->belongsTo(TipoEventoSanitario::class, 'tipo_evento_id');
    }

    /**
     * @return BelongsTo<Vacuna, $this>
     */
    public function vacuna(): BelongsTo
    {
        return $this->belongsTo(Vacuna::class);
    }
}
