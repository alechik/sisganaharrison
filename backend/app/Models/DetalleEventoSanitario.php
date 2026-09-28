<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Captura histórica de un animal en un evento sanitario.
 *
 * @property int $id
 * @property int $evento_sanitario_id
 * @property int $animal_id
 * @property int|null $lote_id
 * @property int $medicamento_id
 * @property string $peso_animal
 * @property string $precio_medicamento
 */
class DetalleEventoSanitario extends Model
{
    protected $table = 'detalle_eventos_sanitarios';

    protected $fillable = [
        'evento_sanitario_id',
        'animal_id',
        'lote_id',
        'medicamento_id',
        'peso_animal',
        'precio_medicamento',
    ];

    protected function casts(): array
    {
        return [
            'peso_animal' => 'decimal:2',
            'precio_medicamento' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<EventoSanitario, $this>
     */
    public function eventoSanitario(): BelongsTo
    {
        return $this->belongsTo(EventoSanitario::class, 'evento_sanitario_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'animal_id');
    }

    /**
     * @return BelongsTo<Lote, $this>
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class, 'lote_id');
    }

    /**
     * @return BelongsTo<Medicamento, $this>
     */
    public function medicamento(): BelongsTo
    {
        return $this->belongsTo(Medicamento::class, 'medicamento_id');
    }
}
