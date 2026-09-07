<?php

namespace App\Models;

use Database\Factories\PersonaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Socio de negocio (persona física o jurídica).
 *
 * @property int $id
 * @property string $razon_social
 * @property string|null $responsable
 * @property string|null $email
 * @property \Illuminate\Support\Carbon|null $fecha_nacimiento
 * @property int|null $ci
 * @property string|null $nit
 * @property int|null $celular
 * @property string|null $estado_civil
 * @property string|null $sexo
 * @property string|null $direccion
 * @property string $estado
 * @property \Illuminate\Support\Carbon|null $fecha_reg
 * @property int $user_id
 */
class Persona extends Model
{
    /** @use HasFactory<PersonaFactory> */
    use HasFactory, SoftDeletes;

    public const ESTADO_ACTIVO = 'ACTIVO';

    public const ESTADO_INACTIVO = 'INACTIVO';

    public const ESTADOS = [
        self::ESTADO_ACTIVO,
        self::ESTADO_INACTIVO,
    ];

    public const SEXOS = ['M', 'H'];

    public const ESTADOS_CIVILES = [
        'SOLTERO',
        'CASADO',
        'UNION_LIBRE',
        'DIVORCIADO',
        'VIUDO',
    ];

    protected $table = 'personas';

    protected $fillable = [
        'razon_social',
        'responsable',
        'email',
        'fecha_nacimiento',
        'ci',
        'nit',
        'celular',
        'estado_civil',
        'sexo',
        'direccion',
        'estado',
        'fecha_reg',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'fecha_reg' => 'date',
            'ci' => 'integer',
            'celular' => 'integer',
        ];
    }

    /**
     * @return BelongsToMany<TipoPersona, $this>
     */
    public function tipos(): BelongsToMany
    {
        return $this->belongsToMany(TipoPersona::class, 'personas_tipo', 'persona_id', 'rol_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @param  Builder<Persona>  $query
     * @return Builder<Persona>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_ACTIVO);
    }

    public function estaActivo(): bool
    {
        return $this->estado === self::ESTADO_ACTIVO;
    }
}
