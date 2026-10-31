<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InformeDiario extends Model
{
    public const REVISADO_SI = 'SI';
    public const REVISADO_NO = 'NO';

    public const REVISADOS = [
        self::REVISADO_SI,
        self::REVISADO_NO,
    ];

    protected $table = 'informe_diarios';

    protected $fillable = [
        'user_trabajador_id',
        'codigo_informe',
        'detalle_informe',
        'revisado',
        'fecha',
        'fecha_revision',
        'user_revisor_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'fecha_revision' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_trabajador_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function revisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_revisor_id');
    }

    public function estaRevisado(): bool
    {
        return $this->revisado === self::REVISADO_SI;
    }
}
