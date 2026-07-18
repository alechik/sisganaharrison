<?php

namespace App\Models;

use Database\Factories\NacimientoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registro individual de cría derivada de un parto.
 *
 * @property int $id
 * @property int $parto_id
 * @property int|null $animal_id
 * @property string|null $arete
 * @property string $sexo
 * @property string|null $peso_nacimiento
 * @property string $estado_nacimiento
 * @property string|null $causa_muerte
 * @property string|null $observaciones
 * @property int|null $registrado_por
 */
class Nacimiento extends Model
{
    /** @use HasFactory<NacimientoFactory> */
    use HasFactory;

    public const ESTADO_VIVO = 'VIVO';

    public const ESTADO_MUERTO = 'MUERTO';

    public const ESTADOS = [
        self::ESTADO_VIVO,
        self::ESTADO_MUERTO,
    ];

    public const SEXOS = ['M', 'H'];

    protected $table = 'nacimientos';

    protected $fillable = [
        'parto_id',
        'animal_id',
        'arete',
        'sexo',
        'peso_nacimiento',
        'estado_nacimiento',
        'causa_muerte',
        'observaciones',
        'registrado_por',
    ];

    protected function casts(): array
    {
        return [
            'peso_nacimiento' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Parto, $this>
     */
    public function parto(): BelongsTo
    {
        return $this->belongsTo(Parto::class, 'parto_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'animal_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }

    public function esVivo(): bool
    {
        return $this->estado_nacimiento === self::ESTADO_VIVO;
    }

    public function esMuerto(): bool
    {
        return $this->estado_nacimiento === self::ESTADO_MUERTO;
    }
}
