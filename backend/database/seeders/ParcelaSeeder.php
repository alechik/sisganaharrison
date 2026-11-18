<?php

namespace Database\Seeders;

use App\Models\Estancia;
use App\Models\Parcela;
use Illuminate\Database\Seeder;

class ParcelaSeeder extends Seeder
{
    /**
     * Catálogo inicial de parcelas por estancia.
     *
     * @var list<array<string, mixed>>
     */
    public const PARCELAS = [
        [
            'estancia_codigo' => 'HAC_EL_CARMEN',
            'codigo' => 'PAR_CARMEN_N',
            'nombre' => 'Parcela Norte',
            'area_ha' => 120.50,
            'tipo_pasto' => 'Brachiaria',
            'descripcion' => 'Parcela principal de engorde en sector norte.',
        ],
        [
            'estancia_codigo' => 'HAC_EL_CARMEN',
            'codigo' => 'PAR_CARMEN_S',
            'nombre' => 'Parcela Sur',
            'area_ha' => 95.00,
            'tipo_pasto' => 'Gamba',
            'descripcion' => 'Parcela de descanso y recuperación forrajera.',
        ],
        [
            'estancia_codigo' => 'EST_SAN_JOSE',
            'codigo' => 'PAR_SJ_01',
            'nombre' => 'Parcela San José 1',
            'area_ha' => 80.25,
            'tipo_pasto' => 'Natural',
            'descripcion' => 'División extensiva con aguadas naturales.',
        ],
        [
            'estancia_codigo' => 'EST_SAN_JOSE',
            'codigo' => 'PAR_SJ_02',
            'nombre' => 'Parcela San José 2',
            'area_ha' => 65.75,
            'tipo_pasto' => 'Mezclado',
            'descripcion' => 'Parcela para manejo rotacional.',
        ],
        [
            'estancia_codigo' => 'AGRO_HARRISON',
            'codigo' => 'PAR_HARR_A',
            'nombre' => 'Parcela Alpha',
            'area_ha' => 45.00,
            'tipo_pasto' => 'Brachiaria',
            'descripcion' => 'Parcela cercana al corral de ordeño.',
        ],
        [
            'estancia_codigo' => 'HAC_LOS_ALEROS',
            'codigo' => 'PAR_ALEROS_1',
            'nombre' => 'Los Aleros 1',
            'area_ha' => 110.00,
            'tipo_pasto' => 'Gamba',
            'descripcion' => 'Parcela de cría en sistema extensivo.',
        ],
        [
            'estancia_codigo' => 'EST_EL_PROGRESO',
            'codigo' => 'PAR_PROG_E',
            'nombre' => 'El Progreso Este',
            'area_ha' => 150.00,
            'tipo_pasto' => 'Brachiaria',
            'descripcion' => 'Parcela de mayor capacidad de la estancia.',
        ],
        [
            'estancia_codigo' => 'HAC_SANTA_ROSA',
            'codigo' => 'PAR_SROSA_1',
            'nombre' => 'Santa Rosa Principal',
            'area_ha' => 200.00,
            'tipo_pasto' => 'Natural',
            'descripcion' => 'Parcela de pastoreo en temporada de lluvias.',
        ],
    ];

    public function run(): void
    {
        foreach (self::PARCELAS as $parcela) {
            $estancia = Estancia::query()
                ->where('codigo', $parcela['estancia_codigo'])
                ->first();

            if (! $estancia) {
                continue;
            }

            Parcela::firstOrCreate(
                ['codigo' => $parcela['codigo']],
                [
                    'estancia_id' => $estancia->id,
                    'nombre' => $parcela['nombre'],
                    'area_ha' => $parcela['area_ha'],
                    'tipo_pasto' => $parcela['tipo_pasto'],
                    'descripcion' => $parcela['descripcion'],
                    'disponibilidad' => true,
                    'activo' => true,
                ]
            );
        }
    }
}
