<?php

namespace Database\Seeders;

use App\Models\Lote;
use App\Models\Potrero;
use Illuminate\Database\Seeder;

class LoteSeeder extends Seeder
{
    /**
     * Catálogo inicial de lotes por potrero.
     *
     * @var list<array<string, mixed>>
     */
    public const LOTES = [
        [
            'potrero_codigo' => 'POT_CARMEN_N',
            'codigo' => 'LOT_CARMEN_ENG',
            'nombre' => 'Lote Engorde Norte',
            'capacidad_animales' => 120,
            'area_ha' => 45.50,
            'observaciones' => 'Lote principal de engorde en potrero norte.',
        ],
        [
            'potrero_codigo' => 'POT_CARMEN_S',
            'codigo' => 'LOT_CARMEN_CRIA',
            'nombre' => 'Lote Cría Sur',
            'capacidad_animales' => 80,
            'area_ha' => 35.00,
            'observaciones' => 'Lote de cría en potrero sur.',
        ],
        [
            'potrero_codigo' => 'POT_SJ_01',
            'codigo' => 'LOT_SJ_A',
            'nombre' => 'Lote San José A',
            'capacidad_animales' => 60,
            'area_ha' => 28.25,
            'observaciones' => 'Primer lote operativo de San José.',
        ],
        [
            'potrero_codigo' => 'POT_SJ_02',
            'codigo' => 'LOT_SJ_B',
            'nombre' => 'Lote San José B',
            'capacidad_animales' => 55,
            'area_ha' => 22.50,
            'observaciones' => 'Lote para manejo rotacional.',
        ],
        [
            'potrero_codigo' => 'POT_HARR_A',
            'codigo' => 'LOT_HARR_ORO',
            'nombre' => 'Lote Ordeño Alpha',
            'capacidad_animales' => 40,
            'area_ha' => 15.00,
            'observaciones' => 'Lote cercano al corral de ordeño.',
        ],
        [
            'potrero_codigo' => 'POT_ALEROS_1',
            'codigo' => 'LOT_ALEROS_CRIA',
            'nombre' => 'Lote Cría Los Aleros',
            'capacidad_animales' => 100,
            'area_ha' => 50.00,
            'observaciones' => 'Lote extensivo de cría.',
        ],
        [
            'potrero_codigo' => 'POT_PROG_E',
            'codigo' => 'LOT_PROG_01',
            'nombre' => 'Lote El Progreso 1',
            'capacidad_animales' => 150,
            'area_ha' => 70.00,
            'observaciones' => 'Lote de mayor capacidad del establecimiento.',
        ],
        [
            'potrero_codigo' => 'POT_SROSA_1',
            'codigo' => 'LOT_SROSA_INV',
            'nombre' => 'Lote Santa Rosa Invierno',
            'capacidad_animales' => 90,
            'area_ha' => 55.00,
            'observaciones' => 'Lote de pastoreo en temporada seca.',
        ],
    ];

    public function run(): void
    {
        foreach (self::LOTES as $lote) {
            $potrero = Potrero::query()
                ->where('codigo', $lote['potrero_codigo'])
                ->first();

            if (! $potrero) {
                continue;
            }

            Lote::firstOrCreate(
                ['codigo' => $lote['codigo']],
                [
                    'potrero_id' => $potrero->id,
                    'nombre' => $lote['nombre'],
                    'capacidad_animales' => $lote['capacidad_animales'],
                    'area_ha' => $lote['area_ha'],
                    'observaciones' => $lote['observaciones'],
                    'activo' => true,
                ]
            );
        }
    }
}
