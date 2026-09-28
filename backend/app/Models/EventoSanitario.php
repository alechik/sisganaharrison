<?php

namespace App\Models;

use Database\Factories\EventoSanitarioFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Cabecera de un evento sanitario (1 a N animales).
 *
 * @property int $id
 * @property int $tipo_evento_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $fecha
 * @property string|null $diagnostico
 * @property string|null $tratamiento
 * @property string $total
 * @property string|null $observaciones
 */
class EventoSanitario extends Model
{
    /** @use HasFactory<EventoSanitarioFactory> */
    use HasFactory;

    protected $table = 'eventos_sanitarios';

    protected $fillable = [
        'tipo_evento_id',
        'user_id',
        'fecha',
        'diagnostico',
        'tratamiento',
        'total',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<TipoEventoSanitario, $this>
     */
    public function tipoEvento(): BelongsTo
    {
        return $this->belongsTo(TipoEventoSanitario::class, 'tipo_evento_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<DetalleEventoSanitario, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleEventoSanitario::class, 'evento_sanitario_id');
    }
}
