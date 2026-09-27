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
 * @property string|null $fecha_nacimiento
 * @property int|null $raza_id
 * @property int $categoria_id
 * @property int|null $estado_productivo_id
 * @property int|null $lote_id
 * @property int|null $madre_id
 * @property int|null $padre_id
 * @property string|null $color
 * @property string|null $observaciones
 * @property int $user_id
 * @property int|null $edad_inicial
 * @property int|null $edad_actual
 * @property string|null $precio_kilo
 * @property string $estado
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
        'user_id',
        'edad_inicial',
        'edad_actual',
        'precio_kilo',
        'estado',
    ];

    public const ESTADO_ACTIVO = 'ACTIVO';

    public const ESTADO_INGRESO_POR_COMPRA = 'INGRESO POR COMPRA';

    public const ESTADO_RESERVADO = 'RESERVADO';

    public const ESTADO_ENFERMO = 'ENFERMO';

    public const ESTADO_MUERTO = 'MUERTO';

    public const ESTADO_VENDIDO = 'VENDIDO';

    public const ESTADO_DESTETADO = 'DESTETADO';

    public const ESTADO_OTRO = 'OTRO';

    public const ESTADOS = [
        self::ESTADO_ACTIVO,
        self::ESTADO_INGRESO_POR_COMPRA,
        self::ESTADO_RESERVADO,
        self::ESTADO_ENFERMO,
        self::ESTADO_MUERTO,
        self::ESTADO_VENDIDO,
        self::ESTADO_DESTETADO,
        self::ESTADO_OTRO,
    ];

    public const ESTADOS_DISPONIBLES_VENTA = [
        self::ESTADO_ACTIVO,
    ];

    public const ESTADOS_DISPONIBLES_SALIDA = [
        self::ESTADO_ACTIVO,
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'edad_inicial' => 'integer',
            'edad_actual' => 'integer',
            'precio_kilo' => 'decimal:2',
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
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<DetallePesaje, $this>
     */
    public function detallesPesaje(): HasMany
    {
        return $this->hasMany(DetallePesaje::class);
    }

    /**
     * @return HasMany<AnimalEvento, $this>
     */
    public function eventos(): HasMany
    {
        return $this->hasMany(AnimalEvento::class);
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

    public const ARETES_INVALIDOS = [
        'bull',
    ];

    /**
     * @param  Builder<Animal>  $query
     * @return Builder<Animal>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_ACTIVO);
    }

    /**
     * @param  Builder<Animal>  $query
     * @return Builder<Animal>
     */
    public function scopeDisponiblesParaVenta(Builder $query): Builder
    {
        return $query->whereIn('estado', self::ESTADOS_DISPONIBLES_VENTA);
    }

    public function estaActivo(): bool
    {
        return $this->estado === self::ESTADO_ACTIVO;
    }

    public function scopeDisponiblesParaSalida(Builder $query): Builder
    {
        return $query->whereIn('estado', self::ESTADOS_DISPONIBLES_SALIDA);
    }

    public function estaDisponibleParaVenta(): bool
    {
        return in_array($this->estado, self::ESTADOS_DISPONIBLES_VENTA, true);
    }

    public function estaDisponibleParaSalida(): bool
    {
        return in_array($this->estado, self::ESTADOS_DISPONIBLES_SALIDA, true);
    }

    public function getActivoAttribute(): bool
    {
        return $this->estaActivo();
    }

    /**
     * @param  Builder<Animal>  $query
     * @return Builder<Animal>
     */
    public function scopeConArete(Builder $query): Builder
    {
        return static::aplicarFiltroAreteValido($query);
    }

    public function tieneAreteAsignado(): bool
    {
        return $this->tieneAreteValido();
    }

    public function tieneAreteValido(): bool
    {
        $arete = strtolower(trim((string) $this->arete));

        return $arete !== '' && ! in_array($arete, self::ARETES_INVALIDOS, true);
    }

    /**
     * @param  Builder<Animal>|\Illuminate\Database\Query\Builder  $query
     * @return Builder<Animal>|\Illuminate\Database\Query\Builder
     */
    public static function aplicarFiltroAreteValido($query)
    {
        $placeholders = implode(',', array_fill(0, count(self::ARETES_INVALIDOS), '?'));

        return $query
            ->whereNotNull('arete')
            ->whereRaw("BTRIM(arete) <> ''")
            ->whereRaw("LOWER(BTRIM(arete)) not in ({$placeholders})", self::ARETES_INVALIDOS);
    }
}
