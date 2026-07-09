<?php

namespace Database\Seeders;

use App\Models\Establecimiento;
use Illuminate\Database\Seeder;

class EstablecimientoSeeder extends Seeder
{
    /**
     * Catálogo inicial de establecimientos ganaderos.
     *
     * @var list<array<string, mixed>>
     */
    public const ESTABLECIMIENTOS = [
        [
            'codigo' => 'HAC_EL_CARMEN',
            'nombre' => 'Hacienda El Carmen',
            'propietario' => 'Familia Rodríguez',
            'telefono' => '+591 76432100',
            'direccion' => 'Carretera a Warnes Km 42',
            'municipio' => 'Warnes',
            'departamento' => 'Santa Cruz',
            'pais' => 'Bolivia',
            'area_total_ha' => 1250.50,
            'descripcion' => 'Unidad productiva dedicada a cría y engorde bovino.',
        ],
        [
            'codigo' => 'EST_SAN_JOSE',
            'nombre' => 'Estancia San José',
            'propietario' => 'Ganadera San José S.R.L.',
            'telefono' => '+591 33445566',
            'direccion' => 'Zona San José de Chiquitos',
            'municipio' => 'San José de Chiquitos',
            'departamento' => 'Santa Cruz',
            'pais' => 'Bolivia',
            'area_total_ha' => 890.00,
            'descripcion' => 'Estancia con potreros naturales y manejo extensivo.',
        ],
        [
            'codigo' => 'AGRO_HARRISON',
            'nombre' => 'Agropecuaria Harrison',
            'propietario' => 'Harrison Agro S.A.',
            'telefono' => '+591 22112233',
            'direccion' => 'Av. Banzer Km 8.5',
            'municipio' => 'Santa Cruz de la Sierra',
            'departamento' => 'Santa Cruz',
            'pais' => 'Bolivia',
            'area_total_ha' => 420.75,
            'descripcion' => 'Establecimiento mixto con producción lechera y de carne.',
        ],
        [
            'codigo' => 'HAC_LOS_ALEROS',
            'nombre' => 'Hacienda Los Aleros',
            'propietario' => 'María Elena Vargas',
            'telefono' => '+591 71234567',
            'direccion' => 'Comunidad Los Aleros',
            'municipio' => 'Montero',
            'departamento' => 'Santa Cruz',
            'pais' => 'Bolivia',
            'area_total_ha' => 680.25,
            'descripcion' => 'Propiedad familiar orientada a reproducción y levante.',
        ],
        [
            'codigo' => 'EST_EL_PROGRESO',
            'nombre' => 'Estancia El Progreso',
            'propietario' => 'Cooperativa El Progreso',
            'telefono' => '+591 67890123',
            'direccion' => 'Camino rural El Progreso',
            'municipio' => 'San Ignacio',
            'departamento' => 'Santa Cruz',
            'pais' => 'Bolivia',
            'area_total_ha' => 1520.00,
            'descripcion' => 'Establecimiento cooperativo con manejo rotacional de potreros.',
        ],
        [
            'codigo' => 'HAC_SANTA_ROSA',
            'nombre' => 'Hacienda Santa Rosa',
            'propietario' => 'Inversiones Santa Rosa Ltda.',
            'telefono' => '+591 75678901',
            'direccion' => 'Zona Santa Rosa de Yacuma',
            'municipio' => 'Santa Rosa',
            'departamento' => 'Beni',
            'pais' => 'Bolivia',
            'area_total_ha' => 2100.00,
            'descripcion' => 'Hacienda extensiva en región llana del Beni.',
        ],
        [
            'codigo' => 'EST_VILLA_BELLA',
            'nombre' => 'Estancia Villa Bella',
            'propietario' => 'Carlos Méndez',
            'telefono' => '+591 62345678',
            'direccion' => 'Villa Bella de Yacuma',
            'municipio' => 'Santa Ana del Yacuma',
            'departamento' => 'Beni',
            'pais' => 'Bolivia',
            'area_total_ha' => 975.50,
            'descripcion' => 'Estancia con infraestructura para confinamiento estacional.',
        ],
        [
            'codigo' => 'AGRO_VALLE_VERDE',
            'nombre' => 'Agropecuaria Valle Verde',
            'propietario' => 'Valle Verde S.R.L.',
            'telefono' => '+591 44556677',
            'direccion' => 'Valle Verde, zona rural',
            'municipio' => 'Cotoca',
            'departamento' => 'Santa Cruz',
            'pais' => 'Bolivia',
            'area_total_ha' => 540.00,
            'descripcion' => 'Unidad productiva con énfasis en genética mejorada.',
        ],
    ];

    public function run(): void
    {
        foreach (self::ESTABLECIMIENTOS as $establecimiento) {
            Establecimiento::firstOrCreate(
                ['codigo' => $establecimiento['codigo']],
                [
                    'nombre' => $establecimiento['nombre'],
                    'propietario' => $establecimiento['propietario'],
                    'telefono' => $establecimiento['telefono'],
                    'direccion' => $establecimiento['direccion'],
                    'municipio' => $establecimiento['municipio'],
                    'departamento' => $establecimiento['departamento'],
                    'pais' => $establecimiento['pais'],
                    'area_total_ha' => $establecimiento['area_total_ha'],
                    'descripcion' => $establecimiento['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
