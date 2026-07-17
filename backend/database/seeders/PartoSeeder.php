<?php

namespace Database\Seeders;

use App\Models\Gestacion;
use App\Models\Parto;
use App\Models\ServicioReproductivo;
use Illuminate\Database\Seeder;

class PartoSeeder extends Seeder
{
    /**
     * Partos asociados a gestaciones del rodeo.
     *
     * @var list<array<string, mixed>>
     */
    public const PARTOS = [
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2024-09-15',
            'fecha_parto' => '2025-06-22',
            'observaciones' => 'Parto sin complicaciones. Cría macho.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2024-10-01',
            'fecha_parto' => '2025-07-08',
            'observaciones' => 'Parto asistido. Hembra y cría en buen estado.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-03-10',
            'fecha_parto' => '2025-12-17',
            'observaciones' => 'Parto gemelar. Requiere seguimiento de nacimientos.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-003',
            'fecha_servicio' => '2025-05-18',
            'fecha_parto' => '2026-02-24',
            'observaciones' => 'Parto en potrero de maternidad.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2025-04-05',
            'fecha_parto' => '2026-01-12',
            'observaciones' => 'Parto nocturno registrado al día siguiente.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-06-01',
            'fecha_parto' => '2026-03-08',
            'observaciones' => 'Parto por transferencia de embrión.',
        ],
    ];

    public function run(): void
    {
        foreach (self::PARTOS as $partoData) {
            $servicio = ServicioReproductivo::query()
                ->whereHas('hembra', fn ($query) => $query->where('codigo', $partoData['hembra_codigo']))
                ->whereDate('fecha_servicio', $partoData['fecha_servicio'])
                ->first();

            if (! $servicio) {
                continue;
            }

            $gestacion = Gestacion::query()
                ->where('servicio_id', $servicio->id)
                ->first();

            if (! $gestacion) {
                continue;
            }

            Parto::firstOrCreate(
                ['gestacion_id' => $gestacion->id],
                [
                    'fecha_parto' => $partoData['fecha_parto'],
                    'observaciones' => $partoData['observaciones'],
                ]
            );

            $gestacion->update(['estado' => 'FINALIZADA']);
        }
    }
}
