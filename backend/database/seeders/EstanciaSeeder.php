<?php

namespace Database\Seeders;

use App\Models\Estancia;
use Illuminate\Database\Seeder;

class EstanciaSeeder extends Seeder
{
    /**
     * Catálogo inicial de estancias ganaderos.
     *
     * @var list<array<string, mixed>>
     */
    public const ESTANCIAS = [
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
            'descripcion' => 'Estancia con parcelas naturales y manejo extensivo.',
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
            'descripcion' => 'Estancia mixta con producción lechera y de carne.',
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
            'descripcion' => 'Estancia cooperativa con manejo rotacional de parcelas.',
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
        foreach (self::ESTANCIAS as $estancia) {
            Estancia::firstOrCreate(
                ['codigo' => $estancia['codigo']],
                [
                    'nombre' => $estancia['nombre'],
                    'propietario' => $estancia['propietario'],
                    'telefono' => $estancia['telefono'],
                    'direccion' => $estancia['direccion'],
                    'municipio' => $estancia['municipio'],
                    'departamento' => $estancia['departamento'],
                    'pais' => $estancia['pais'],
                    'area_total_ha' => $estancia['area_total_ha'],
                    'descripcion' => $estancia['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
