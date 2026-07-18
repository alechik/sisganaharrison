<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\Nacimiento;
use App\Models\Parto;
use App\Models\User;
use Illuminate\Database\Seeder;

class NacimientoSeeder extends Seeder
{
    /**
     * @var list<array<string, mixed>>
     */
    public const NACIMIENTOS = [
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2024-09-15',
            'fecha_parto' => '2025-06-22',
            'arete' => 'AR-3001',
            'sexo' => 'M',
            'peso_nacimiento' => 38.5,
            'estado_nacimiento' => 'VIVO',
            'observaciones' => 'Cría macho nacida con buen peso.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2024-10-01',
            'fecha_parto' => '2025-07-08',
            'arete' => 'AR-3002',
            'sexo' => 'H',
            'peso_nacimiento' => 35.2,
            'estado_nacimiento' => 'VIVO',
            'observaciones' => 'Cría hembra vigorosa.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-03-10',
            'fecha_parto' => '2025-12-17',
            'arete' => 'AR-3003',
            'sexo' => 'M',
            'peso_nacimiento' => 32.0,
            'estado_nacimiento' => 'VIVO',
            'observaciones' => 'Primera cría gemelar.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-03-10',
            'fecha_parto' => '2025-12-17',
            'arete' => null,
            'sexo' => 'H',
            'peso_nacimiento' => 28.5,
            'estado_nacimiento' => 'MUERTO',
            'causa_muerte' => 'Distocia prolongada',
            'observaciones' => 'Segunda cría gemelar nacida muerta.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-003',
            'fecha_servicio' => '2025-05-18',
            'fecha_parto' => '2026-02-24',
            'arete' => 'AR-3004',
            'sexo' => 'H',
            'peso_nacimiento' => 34.8,
            'estado_nacimiento' => 'VIVO',
            'observaciones' => 'Pendiente de alta en inventario.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2025-04-05',
            'fecha_parto' => '2026-01-12',
            'arete' => null,
            'sexo' => 'M',
            'peso_nacimiento' => null,
            'estado_nacimiento' => 'MUERTO',
            'causa_muerte' => 'Malformación congénita',
            'observaciones' => 'No viable al nacer.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-001',
            'fecha_servicio' => '2025-06-01',
            'fecha_parto' => '2026-03-08',
            'arete' => 'AR-3005',
            'sexo' => 'M',
            'peso_nacimiento' => 36.1,
            'estado_nacimiento' => 'VIVO',
            'observaciones' => 'Cría por transferencia de embrión.',
        ],
        [
            'hembra_codigo' => 'AN-VACA-002',
            'fecha_servicio' => '2024-10-01',
            'fecha_parto' => '2025-07-08',
            'arete' => 'AR-3006',
            'sexo' => 'M',
            'peso_nacimiento' => 33.4,
            'estado_nacimiento' => 'VIVO',
            'observaciones' => 'Segunda cría del mismo parto.',
        ],
    ];

    public function run(): void
    {
        $registradoPor = User::query()->orderBy('id')->value('id');

        foreach (self::NACIMIENTOS as $nacimientoData) {
            $parto = Parto::query()
                ->whereDate('fecha_parto', $nacimientoData['fecha_parto'])
                ->whereHas('gestacion.servicio.hembra', fn ($query) => $query->where(
                    'codigo',
                    $nacimientoData['hembra_codigo']
                ))
                ->whereHas('gestacion.servicio', fn ($query) => $query->whereDate(
                    'fecha_servicio',
                    $nacimientoData['fecha_servicio']
                ))
                ->first();

            if (! $parto) {
                continue;
            }

            $animalId = null;
            if (
                $nacimientoData['estado_nacimiento'] === Nacimiento::ESTADO_VIVO
                && ! empty($nacimientoData['animal_codigo'] ?? null)
            ) {
                $animalId = Animal::query()
                    ->where('codigo', $nacimientoData['animal_codigo'])
                    ->value('id');
            }

            Nacimiento::firstOrCreate(
                [
                    'parto_id' => $parto->id,
                    'arete' => $nacimientoData['arete'],
                    'sexo' => $nacimientoData['sexo'],
                    'estado_nacimiento' => $nacimientoData['estado_nacimiento'],
                ],
                [
                    'animal_id' => $animalId,
                    'peso_nacimiento' => $nacimientoData['peso_nacimiento'],
                    'causa_muerte' => $nacimientoData['causa_muerte'] ?? null,
                    'observaciones' => $nacimientoData['observaciones'],
                    'registrado_por' => $registradoPor,
                ]
            );
        }
    }
}
