<?php

namespace Database\Seeders;

use App\Models\TipoPersona;
use Illuminate\Database\Seeder;

class TipoPersonaSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    public const TIPOS = [
        TipoPersona::CLIENTE,
        TipoPersona::PROVEEDOR,
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $nombre) {
            TipoPersona::query()->firstOrCreate(['nombre' => $nombre]);
        }
    }
}
