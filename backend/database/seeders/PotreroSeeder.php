<?php

namespace Database\Seeders;

use App\Models\Potrero;
use App\Models\Parcela;
use Illuminate\Database\Seeder;

class PotreroSeeder extends Seeder
{
    /**
     * Catálogo inicial de potreros por parcela.
     *
     * @var list<array<string, mixed>>
     */
    public const POTREROS = [
        [
            'parcela_codigo' => 'PAR_CARMEN_N',
            'codigo' => 'POT_CARMEN_ENG',
            'nombre' => 'Potrero Engorde Norte',
            'capacidad_animales' => 120,
            'area_ha' => 45.50,
            'observaciones' => 'Potrero principal de engorde en parcela norte.',
        ],
        [
            'parcela_codigo' => 'PAR_CARMEN_S',
            'codigo' => 'POT_CARMEN_CRIA',
            'nombre' => 'Potrero Cría Sur',
            'capacidad_animales' => 80,
            'area_ha' => 35.00,
            'observaciones' => 'Potrero de cría en parcela sur.',
        ],
        [
            'parcela_codigo' => 'PAR_SJ_01',
            'codigo' => 'POT_SJ_A',
            'nombre' => 'Potrero San José A',
            'capacidad_animales' => 60,
            'area_ha' => 28.25,
            'observaciones' => 'Primer potrero operativo de San José.',
        ],
        [
            'parcela_codigo' => 'PAR_SJ_02',
            'codigo' => 'POT_SJ_B',
            'nombre' => 'Potrero San José B',
            'capacidad_animales' => 55,
            'area_ha' => 22.50,
            'observaciones' => 'Potrero para manejo rotacional.',
        ],
        [
            'parcela_codigo' => 'PAR_HARR_A',
            'codigo' => 'POT_HARR_ORO',
            'nombre' => 'Potrero Ordeño Alpha',
            'capacidad_animales' => 40,
            'area_ha' => 15.00,
            'observaciones' => 'Potrero cercano al corral de ordeño.',
        ],
        [
            'parcela_codigo' => 'PAR_ALEROS_1',
            'codigo' => 'POT_ALEROS_CRIA',
            'nombre' => 'Potrero Cría Los Aleros',
            'capacidad_animales' => 100,
            'area_ha' => 50.00,
            'observaciones' => 'Potrero extensivo de cría.',
        ],
        [
            'parcela_codigo' => 'PAR_PROG_E',
            'codigo' => 'POT_PROG_01',
            'nombre' => 'Potrero El Progreso 1',
            'capacidad_animales' => 150,
            'area_ha' => 70.00,
            'observaciones' => 'Potrero de mayor capacidad de la estancia.',
        ],
        [
            'parcela_codigo' => 'PAR_SROSA_1',
            'codigo' => 'POT_SROSA_INV',
            'nombre' => 'Potrero Santa Rosa Invierno',
            'capacidad_animales' => 90,
            'area_ha' => 55.00,
            'observaciones' => 'Potrero de pastoreo en temporada seca.',
        ],
    ];

    public function run(): void
    {
        foreach (self::POTREROS as $potrero) {
            $parcela = Parcela::query()
                ->where('codigo', $potrero['parcela_codigo'])
                ->first();

            if (! $parcela) {
                continue;
            }

            Potrero::firstOrCreate(
                ['codigo' => $potrero['codigo']],
                [
                    'parcela_id' => $parcela->id,
                    'nombre' => $potrero['nombre'],
                    'capacidad_animales' => $potrero['capacidad_animales'],
                    'area_ha' => $potrero['area_ha'],
                    'observaciones' => $potrero['observaciones'],
                    'activo' => true,
                ]
            );
        }
    }
}
