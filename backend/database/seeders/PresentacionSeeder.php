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
    ];

    public function run(): void
    {
        foreach (self::PRESENTACIONES as $descripcion) {
            Presentacion::firstOrCreate(
                ['descripcion' => $descripcion]
            );
        }
    }
}
