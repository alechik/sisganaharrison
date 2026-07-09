<?php

namespace Database\Seeders;

use App\Models\Establecimiento;
use App\Models\Potrero;
use Illuminate\Database\Seeder;

class PotreroSeeder extends Seeder
{
    /**
     * Catálogo inicial de potreros por establecimiento.
     *
     * @var list<array<string, mixed>>
     */
    public const POTREROS = [
        [
            'establecimiento_codigo' => 'HAC_EL_CARMEN',
            'codigo' => 'POT_CARMEN_N',
            'nombre' => 'Potrero Norte',
            'area_ha' => 120.50,
            'tipo_pasto' => 'Brachiaria',
            'descripcion' => 'Potrero principal de engorde en sector norte.',
        ],
        [
            'establecimiento_codigo' => 'HAC_EL_CARMEN',
            'codigo' => 'POT_CARMEN_S',
            'nombre' => 'Potrero Sur',
            'area_ha' => 95.00,
            'tipo_pasto' => 'Gamba',
            'descripcion' => 'Potrero de descanso y recuperación forrajera.',
        ],
        [
            'establecimiento_codigo' => 'EST_SAN_JOSE',
            'codigo' => 'POT_SJ_01',
            'nombre' => 'Potrero San José 1',
            'area_ha' => 80.25,
            'tipo_pasto' => 'Natural',
            'descripcion' => 'División extensiva con aguadas naturales.',
        ],
        [
            'establecimiento_codigo' => 'EST_SAN_JOSE',
            'codigo' => 'POT_SJ_02',
            'nombre' => 'Potrero San José 2',
            'area_ha' => 65.75,
            'tipo_pasto' => 'Mezclado',
            'descripcion' => 'Potrero para manejo rotacional.',
        ],
        [
            'establecimiento_codigo' => 'AGRO_HARRISON',
            'codigo' => 'POT_HARR_A',
            'nombre' => 'Potrero Alpha',
            'area_ha' => 45.00,
            'tipo_pasto' => 'Brachiaria',
            'descripcion' => 'Potrero cercano al corral de ordeño.',
        ],
        [
            'establecimiento_codigo' => 'HAC_LOS_ALEROS',
            'codigo' => 'POT_ALEROS_1',
            'nombre' => 'Los Aleros 1',
            'area_ha' => 110.00,
            'tipo_pasto' => 'Gamba',
            'descripcion' => 'Potrero de cría en sistema extensivo.',
        ],
        [
            'establecimiento_codigo' => 'EST_EL_PROGRESO',
            'codigo' => 'POT_PROG_E',
            'nombre' => 'El Progreso Este',
            'area_ha' => 150.00,
            'tipo_pasto' => 'Brachiaria',
            'descripcion' => 'Potrero de mayor capacidad del establecimiento.',
        ],
        [
            'establecimiento_codigo' => 'HAC_SANTA_ROSA',
            'codigo' => 'POT_SROSA_1',
            'nombre' => 'Santa Rosa Principal',
            'area_ha' => 200.00,
            'tipo_pasto' => 'Natural',
            'descripcion' => 'Potrero de pastoreo en temporada de lluvias.',
        ],
    ];

    public function run(): void
    {
        foreach (self::POTREROS as $potrero) {
            $establecimiento = Establecimiento::query()
                ->where('codigo', $potrero['establecimiento_codigo'])
                ->first();

            if (! $establecimiento) {
                continue;
            }

            Potrero::firstOrCreate(
                ['codigo' => $potrero['codigo']],
                [
                    'establecimiento_id' => $establecimiento->id,
                    'nombre' => $potrero['nombre'],
                    'area_ha' => $potrero['area_ha'],
                    'tipo_pasto' => $potrero['tipo_pasto'],
                    'descripcion' => $potrero['descripcion'],
                    'disponibilidad' => true,
                    'activo' => true,
                ]
            );
        }
    }
}
