<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Evento de trazabilidad del animal (ingreso, movimientos, etc.).
 *
 * @property int $id
 * @property int $animal_id
 * @property string $tipo
 * @property string $fecha
 * @property string|null $descripcion
 * @property array<string, mixed>|null $metadata
 */
class AnimalEvento extends Model
{
    public const TIPO_INGRESO = 'INGRESO';

    public const TIPO_RESERVA_VENTA = 'RESERVA_VENTA';

    public const TIPO_LIBERACION_VENTA = 'LIBERACION_VENTA';

    public const TIPO_SALIDA = 'SALIDA';

    protected $table = 'animal_eventos';

    protected $fillable = [
        'animal_id',
        'tipo',
        'fecha',
        'descripcion',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'metadata' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }
}
