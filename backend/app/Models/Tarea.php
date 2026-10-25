<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tarea extends Model
{
    public const VISTA_SI = 'SI';
    public const VISTA_NO = 'NO';

    public const ESTADO_EMITIDO = 'EMITIDO';
    public const ESTADO_PENDIENTE = 'PENDIENTE';
    public const ESTADO_TERMINADO = 'TERMINADO';

    public const ESTADOS = [
        self::ESTADO_EMITIDO,
        self::ESTADO_PENDIENTE,
        self::ESTADO_TERMINADO,
    ];

    protected $table = 'tareas';

    protected $fillable = [
        'user_gerencia_id',
        'user_trabajador_id',
        'codigo_tarea',
        'indicacion',
        'respuesta_indicacion',
        'visto',
        'estado',
        'fecha_inicio',
        'fecha_fin',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'fecha_fin' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function gerencia(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_gerencia_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_trabajador_id');
    }

    public function estaTerminada(): bool
    {
        return $this->estado === self::ESTADO_TERMINADO;
    }
}
