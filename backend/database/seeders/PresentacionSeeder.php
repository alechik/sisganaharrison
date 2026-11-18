<?php

namespace Database\Seeders;

use App\Models\Presentacion;
use Illuminate\Database\Seeder;

class PresentacionSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    public const PRESENTACIONES = [
        'Frasco',
        'Ampolla',
        'Sobre',
        'Bolus',
        'Pour-on',
        'Inyectable',
        'Pajuela',
    ];

    public function run(): void
    {
        foreach (self::PRESENTACIONES as $nombre) {
            Presentacion::query()->updateOrCreate(
                ['nombre' => $nombre]
            );
        }
    }
}
