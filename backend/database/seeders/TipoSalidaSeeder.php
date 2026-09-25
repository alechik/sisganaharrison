<?php

namespace Database\Seeders;

use App\Models\TipoSalida;
use Illuminate\Database\Seeder;

class TipoSalidaSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    public const TIPOS = [
        'Venta',
        'Perdido',
        'Robo',
        'Muerte',
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $nombre) {
            TipoSalida::withTrashed()->firstOrCreate(
                ['nombre' => $nombre]
            );
        }
    }
}
