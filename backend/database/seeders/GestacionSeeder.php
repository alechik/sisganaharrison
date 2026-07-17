<?php

namespace Database\Seeders;

use App\Models\Gestacion;
use App\Models\ServicioReproductivo;
use Illuminate\Database\Seeder;

class GestacionSeeder extends Seeder
{
    /**
     * Seguimiento inicial de gestaciones del rodeo.
     *
     * @var list<array<string, mixed>>
     */
    public const GESTACIONES = [
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2024-09-15',
            'fecha_confirmacion' => '2024-10-20',
            'fecha_probable_parto' => '2025-06-22',
            'estado' => 'FINALIZADA',
            'observaciones' => 'Gestación confirmada por palpación. Parto registrado.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2024-10-01',
            'fecha_confirmacion' => '2024-11-05',
            'fecha_probable_parto' => '2025-07-08',
            'estado' => 'FINALIZADA',
            'observaciones' => 'Gestación concluida con parto exitoso.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-003',
            'fecha_servicio' => '2025-05-18',
            'fecha_confirmacion' => '2025-06-25',
            'fecha_probable_parto' => '2026-02-24',
            'estado' => 'ACTIVA',
            'observaciones' => 'Gestación activa en período seco.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-03-10',
            'fecha_confirmacion' => '2025-04-15',
            'fecha_probable_parto' => '2025-12-17',
            'estado' => 'ACTIVA',
            'observaciones' => 'Seguimiento ecográfico favorable.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2025-04-05',
            'fecha_confirmacion' => null,
            'fecha_probable_parto' => '2026-01-12',
            'estado' => 'ACTIVA',
            'observaciones' => 'Gestación por IA pendiente de confirmación definitiva.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2025-07-12',
            'fecha_confirmacion' => '2025-08-10',
            'fecha_probable_parto' => '2026-04-19',
            'estado' => 'ABORTADA',
            'observaciones' => 'Aborto detectado a los 45 días.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-003',
            'fecha_servicio' => '2025-08-20',
            'fecha_confirmacion' => null,
            'fecha_probable_parto' => '2026-05-29',
            'estado' => 'ACTIVA',
            'observaciones' => 'Nueva gestación en seguimiento.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-06-01',
            'fecha_confirmacion' => '2025-07-08',
            'fecha_probable_parto' => '2026-03-08',
            'estado' => 'ACTIVA',
            'observaciones' => 'Gestación por transferencia de embrión.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-09-05',
            'fecha_confirmacion' => null,
            'fecha_probable_parto' => '2026-06-12',
            'estado' => 'ACTIVA',
            'observaciones' => 'Servicio reciente en evaluación.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2025-05-18',
            'fecha_confirmacion' => '2025-06-20',
            'fecha_probable_parto' => '2026-02-24',
            'estado' => 'PERDIDA',
            'observaciones' => 'Pérdida embrionaria temprana detectada.',
        ],
    ];

    public function run(): void
    {
        foreach (self::GESTACIONES as $gestacionData) {
            $servicio = ServicioReproductivo::query()
                ->whereHas('hembra', fn ($query) => $query->where('codigo', $gestacionData['hembra_codigo']))
                ->whereDate('fecha_servicio', $gestacionData['fecha_servicio'])
                ->first();

            if (! $servicio) {
                continue;
            }

            Gestacion::firstOrCreate(
                ['servicio_id' => $servicio->id],
                [
                    'fecha_confirmacion' => $gestacionData['fecha_confirmacion'],
                    'fecha_probable_parto' => $gestacionData['fecha_probable_parto'],
                    'estado' => $gestacionData['estado'],
                    'observaciones' => $gestacionData['observaciones'],
                ]
            );
        }
    }
}
