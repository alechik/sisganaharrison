<?php

namespace App\Models;

use Database\Factories\GrupoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Validation\ValidationException;

/**
 * Grupo de animales dentro de un lote (potrero en la UI).
 *
 * @property int $id
 * @property int $lote_id
 * @property string $nombre
 * @property string|null $observaciones
 * @property bool $activo
 */
class Grupo extends Model
{
    /** @use HasFactory<GrupoFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'grupos';

    protected $fillable = [
        'lote_id',
        'nombre',
        'observaciones',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Lote, $this>
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class);
    }

    /**
     * @return HasMany<Animal, $this>
     */
    public function animales(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    /**
     * @param  Builder<Grupo>  $query
     * @return Builder<Grupo>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    public static function assertCompatibleConLote(?int $grupoId, ?int $loteId): void
    {
        if ($grupoId === null) {
            return;
        }

        if ($loteId === null) {
            throw ValidationException::withMessages([
                'grupo_id' => 'Seleccione un potrero antes de asignar el grupo.',
            ]);
        }

        $grupo = self::query()
            ->whereKey($grupoId)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->first();

        if (! $grupo) {
            throw ValidationException::withMessages([
                'grupo_id' => 'El grupo seleccionado no existe o no está activo.',
            ]);
        }

        if ((int) $grupo->lote_id !== (int) $loteId) {
            throw ValidationException::withMessages([
                'grupo_id' => 'El grupo no pertenece al potrero seleccionado.',
            ]);
        }
    }
}
