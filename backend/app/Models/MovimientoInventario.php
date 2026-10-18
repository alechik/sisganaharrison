<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MovimientoInventario extends Model
{
    public const TIPO_INGRESO_COMPRA = 'INGRESO_COMPRA';

    public const TIPO_CONSUMO_SANITARIO = 'CONSUMO_SANITARIO';

    public const TIPO_CONSUMO_REPRODUCTIVO = 'CONSUMO_REPRODUCTIVO';

    public const TIPO_ANULACION = 'ANULACION';

    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'almacen_id',
        'medicamento_id',
        'tipo',
        'cantidad',
        'precio_unitario',
        'origen_type',
        'origen_id',
        'user_id',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'decimal:2',
            'precio_unitario' => 'decimal:2',
        ];
    }

    public function afectaPromedioPonderado(): bool
    {
        return in_array($this->tipo, [self::TIPO_INGRESO_COMPRA, self::TIPO_ANULACION], true);
    }

    /**
     * @return BelongsTo<Almacen, $this>
     */
    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }

    /**
     * @return BelongsTo<Medicamento, $this>
     */
    public function medicamento(): BelongsTo
    {
        return $this->belongsTo(Medicamento::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function origen(): MorphTo
    {
        return $this->morphTo();
    }
}
