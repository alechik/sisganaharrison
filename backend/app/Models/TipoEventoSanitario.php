<?php

namespace App\Models;

use Database\Factories\TipoEventoSanitarioFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Catálogo de tipos de eventos sanitarios.
 *
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $descripcion
 * @property bool $activo
 */
class TipoEventoSanitario extends Model
{
    /** @use HasFactory<TipoEventoSanitarioFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'tipos_eventos_sanitarios';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * @param  Builder<TipoEventoSanitario>  $query
     * @return Builder<TipoEventoSanitario>
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    public function requiereVacuna(): bool
    {
        return $this->codigo === 'VACUNACION';
    }
}
