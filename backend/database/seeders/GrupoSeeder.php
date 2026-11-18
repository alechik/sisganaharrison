<?php

namespace Database\Seeders;

use App\Models\Grupo;
use App\Models\Potrero;
use Illuminate\Database\Seeder;

class GrupoSeeder extends Seeder
{
    /**
     * @var list<array{potrero_codigo: string, nombre: string, observaciones: string}>
     */
    public const GRUPOS = [
        [
            'potrero_codigo' => 'POT_CARMEN_ENG',
            'nombre' => 'Engorde principal',
            'observaciones' => 'Animales en terminación en el potrero norte.',
        ],
        [
            'potrero_codigo' => 'POT_CARMEN_CRIA',
            'nombre' => 'Cría y recría',
            'observaciones' => 'Vacas con terneros al pie.',
        ],
        [
            'potrero_codigo' => 'POT_SJ_A',
            'nombre' => 'San José A',
            'observaciones' => 'Grupo operativo de la primera división.',
        ],
        [
            'potrero_codigo' => 'POT_HARR_ORO',
            'nombre' => 'Ordeño',
            'observaciones' => 'Vacas en producción lechera.',
        ],
        [
            'potrero_codigo' => 'POT_ALEROS_CRIA',
            'nombre' => 'Reproductoras',
            'observaciones' => 'Hembras de cría en sistema extensivo.',
        ],
        [
            'potrero_codigo' => 'POT_PROG_01',
            'nombre' => 'Rotación 1',
            'observaciones' => 'Grupo de mayor capacidad de El Progreso.',
        ],
    ];

    public function run(): void
    {
        foreach (self::GRUPOS as $item) {
            $potrero = Potrero::query()
                ->where('codigo', $item['potrero_codigo'])
                ->first();

            if (! $potrero) {
                continue;
            }

            Grupo::query()->firstOrCreate(
                [
                    'potrero_id' => $potrero->id,
                    'nombre' => $item['nombre'],
                ],
                [
                    'observaciones' => $item['observaciones'],
                    'activo' => true,
                ]
            );
        }
    }
}
