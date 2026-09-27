<?php

namespace App\Models;

use Database\Factories\PesajeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Cabecera de una sesión de pesaje (1 a N animales).
 *
 * @property int $id
 * @property string $codigo_pesaje
 * @property \Illuminate\Support\Carbon $fecha_pesaje
 * @property string $total_peso
 * @property string|null $observacion
 * @property int $user_id
 */
class Pesaje extends Model
{
    /** @use HasFactory<PesajeFactory> */
    use HasFactory;

    public const OBSERVACION_NACIMIENTO = 'Pesaje de nacimiento';

    public const OBSERVACION_CUARENTENA = 'Pesaje de cuarentena';

    public const OBSERVACION_INGRESO = 'Pesaje de ingreso';

    protected $table = 'pesajes';

    protected $fillable = [
        'codigo_pesaje',
        'fecha_pesaje',
        'total_peso',
        'observacion',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'fecha_pesaje' => 'date',
            'total_peso' => 'decimal:2',
        ];
    }

    public static function observacionDeIngreso(string $codigoIngreso): string
    {
        return 'Pesaje generado por Ingreso: '.$codigoIngreso;
    }

    public static function observacionDeNacimiento(string $codigoParto): string
    {
        return 'Pesaje generado por Nacimiento - Parto: '.$codigoParto;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<DetallePesaje, $this>
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetallePesaje::class, 'pesaje_id');
    }

    public function esDeNacimiento(): bool
    {
        $observacion = (string) $this->observacion;

        return $observacion === self::OBSERVACION_NACIMIENTO
            || str_starts_with($observacion, 'Pesaje generado por Nacimiento');
    }

    public function esDeIngreso(): bool
    {
        return str_starts_with((string) $this->observacion, 'Pesaje generado por Ingreso:');
    }
}
