<?php

namespace App\Models;

use Database\Factories\TipoPersonaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Catálogo de tipos de socio de negocio (CLIENTE, PROVEEDOR, ...).
 *
 * @property int $id
 * @property string $nombre
 */
class TipoPersona extends Model
{
    /** @use HasFactory<TipoPersonaFactory> */
    use HasFactory;

    public const CLIENTE = 'CLIENTE';

    public const PROVEEDOR = 'PROVEEDOR';

    public const PROTEGIDOS = [
        self::CLIENTE,
        self::PROVEEDOR,
    ];

    protected $table = 'tipo';

    protected $fillable = [
        'nombre',
    ];

    /**
     * @return BelongsToMany<Persona, $this>
     */
    public function personas(): BelongsToMany
    {
        return $this->belongsToMany(Persona::class, 'personas_tipo', 'rol_id', 'persona_id');
    }

    public function esProtegido(): bool
    {
        return in_array($this->nombre, self::PROTEGIDOS, true);
    }
}
