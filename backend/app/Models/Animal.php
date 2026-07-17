<?php

namespace App\Models;

use Database\Factories\AnimalFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Entidad principal del sistema ganadero.
 *
 * @property int $id
 * @property string $codigo
 * @property string|null $arete
 * @property string|null $nombre
 * @property string $sexo
 * @property string $fecha_nacimiento
 * @property int $raza_id
 * @property int $categoria_id
 * @property int $estado_productivo_id
 * @property int $lote_id
 * @property int|null $madre_id
 * @property int|null $padre_id
 * @property string|null $color
 * @property string|null $observaciones
 * @property bool $activo
 */
class Animal extends Model
{
    /** @use HasFactory<AnimalFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'animales';

    protected $fillable = [
        'codigo',
        'arete',
        'nombre',
        'sexo',
        'fecha_nacimiento',
        'raza_id',
        'categoria_id',
        'estado_productivo_id',
        'lote_id',
        'madre_id',
        'padre_id',
        'color',
        'observaciones',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'activo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Raza, $this>
     */
    public function raza(): BelongsTo
    {
        return $this->belongsTo(Raza::class);
    }

    /**
     * @return BelongsTo<CategoriaAnimal, $this>
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaAnimal::class, 'categoria_id');
    }

    /**
     * @return BelongsTo<EstadoProductivo, $this>
     */
    public function estadoProductivo(): BelongsTo
    {
        return $this->belongsTo(EstadoProductivo::class, 'estado_productivo_id');
    }

    /**
     * @return BelongsTo<Lote, $this>
     */
    public function lote(): BelongsTo
    {
        return $this->belongsTo(Lote::class);
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function madre(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'madre_id');
    }

    /**
     * @return BelongsTo<Animal, $this>
     */
    public function padre(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'padre_id');
    }

    /**
     * @return HasMany<Pesaje, $this>
     */
    public function pesajes(): HasMany
    {
        return $this->hasMany(Pesaje::class);
    }

    /**
     * @return HasMany<EventoSanitario, $this>
     */
    public function eventosSanitarios(): HasMany
    {
        return $this->hasMany(EventoSanitario::class);
    }

    /**
     * @return HasMany<ServicioReproductivo, $this>
     */
    public function serviciosComoHembra(): HasMany
    {
        return $this->hasMany(ServicioReproductivo::class, 'hembra_id');
    }

    /**
     * @return HasMany<ServicioReproductivo, $this>
     */
    public function serviciosComoMacho(): HasMany
    {
        return $this->hasMany(ServicioReproductivo::class, 'macho_id');
    }

    /**
     * @param  Builder<Animal>  $query
     * @return Builder<Animal>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
