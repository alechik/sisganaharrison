<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\ServicioReproductivo;
use Illuminate\Database\Seeder;

class ServicioReproductivoSeeder extends Seeder
{
    /**
     * Registro inicial de servicios reproductivos del rodeo.
     *
     * @var list<array<string, mixed>>
     */
    public const SERVICIOS = [
        [
            'hembra_codigo' => 'AN-VACA-001',
            'macho_codigo' => 'AN-TORO-001',
            'fecha_servicio' => '2024-09-15',
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => 'PRENADA',
            'observaciones' => 'Servicio natural en lote de engorde.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'macho_codigo' => 'AN-TORO-001',
            'fecha_servicio' => '2024-10-01',
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => 'PRENADA',
            'observaciones' => 'Monta controlada con toro reproductor.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-003',
            'macho_codigo' => null,
            'fecha_servicio' => '2024-11-20',
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
            'resultado' => 'VACIA',
            'observaciones' => 'IA con semen de toro de alta genética.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'macho_codigo' => 'AN-TORO-001',
            'fecha_servicio' => '2025-03-10',
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => 'PENDIENTE',
            'observaciones' => 'Segundo servicio de la temporada.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'macho_codigo' => null,
            'fecha_servicio' => '2025-04-05',
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
            'resultado' => 'PENDIENTE',
            'observaciones' => 'Re-servicio por IA.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-003',
            'macho_codigo' => 'AN-TORO-001',
            'fecha_servicio' => '2025-05-18',
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => 'PRENADA',
            'observaciones' => 'Vaca en período seco, servicio post destete.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'macho_codigo' => null,
            'fecha_servicio' => '2025-06-01',
            'tipo_servicio' => 'TRANSFERENCIA_EMBRION',
            'resultado' => 'PENDIENTE',
            'observaciones' => 'Transferencia de embrión de alta calidad.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'macho_codigo' => 'AN-TORO-001',
            'fecha_servicio' => '2025-07-12',
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => 'ABORTO',
            'observaciones' => 'Aborto detectado a los 45 días post servicio.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-003',
            'macho_codigo' => null,
            'fecha_servicio' => '2025-08-20',
            'tipo_servicio' => 'INSEMINACION_ARTIFICIAL',
            'resultado' => 'PENDIENTE',
            'observaciones' => 'Nuevo intento reproductivo.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'macho_codigo' => 'AN-TORO-001',
            'fecha_servicio' => '2025-09-05',
            'tipo_servicio' => 'MONTA_NATURAL',
            'resultado' => null,
            'observaciones' => 'Servicio reciente sin diagnóstico aún.',
        ],
    ];

    public function run(): void
    {
        foreach (self::SERVICIOS as $servicioData) {
            $hembra = Animal::query()->where('codigo', $servicioData['hembra_codigo'])->first();

            if (! $hembra) {
                continue;
            }

            $machoId = null;
            if (! empty($servicioData['macho_codigo'])) {
                $macho = Animal::query()->where('codigo', $servicioData['macho_codigo'])->first();
                $machoId = $macho?->id;
            }

            ServicioReproductivo::firstOrCreate(
                [
                    'hembra_id' => $hembra->id,
                    'fecha_servicio' => $servicioData['fecha_servicio'],
                    'tipo_servicio' => $servicioData['tipo_servicio'],
                ],
                [
                    'macho_id' => $machoId,
                    'resultado' => $servicioData['resultado'],
                    'observaciones' => $servicioData['observaciones'],
                ]
            );
        }
    }
}
