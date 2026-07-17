<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\Pesaje;
use Illuminate\Database\Seeder;

class PesajeSeeder extends Seeder
{
    /**
     * Historial inicial de pesajes del rodeo.
     *
     * @var list<array<string, mixed>>
     */
    public const PESAJES = [
        [
            'animal_codigo' => 'AN-TORO-001',
            'fecha' => '2024-06-15',
            'peso' => 780.50,
            'observaciones' => 'Pesaje de control reproductivo.',
        ],
        [
            'animal_codigo' => 'AN-TORO-001',
            'fecha' => '2025-06-15',
            'peso' => 812.00,
            'observaciones' => 'Pesaje anual de seguimiento.',
        ],
        [
            'animal_codigo' => 'AN-VACA-001',
            'fecha' => '2024-03-10',
            'peso' => 520.25,
            'observaciones' => 'Pesaje post-parto.',
        ],
        [
            'animal_codigo' => 'AN-VACA-001',
            'fecha' => '2025-03-10',
            'peso' => 545.75,
            'observaciones' => 'Control de condición corporal.',
        ],
        [
            'animal_codigo' => 'AN-NOV-001',
            'fecha' => '2024-06-05',
            'peso' => 280.00,
            'observaciones' => 'Pesaje al inicio de engorde.',
        ],
        [
            'animal_codigo' => 'AN-NOV-001',
            'fecha' => '2025-01-20',
            'peso' => 410.50,
            'observaciones' => 'Seguimiento de ganancia de peso.',
        ],
        [
            'animal_codigo' => 'AN-TER-001',
            'fecha' => '2025-02-18',
            'peso' => 45.30,
            'observaciones' => 'Pesaje al nacer (registro manual).',
        ],
        [
            'animal_codigo' => 'AN-TER-002',
            'fecha' => '2025-02-20',
            'peso' => 42.80,
            'observaciones' => 'Pesaje al nacer (registro manual).',
        ],
        [
            'animal_codigo' => 'AN-NOV-002',
            'fecha' => '2025-06-01',
            'peso' => 395.00,
            'observaciones' => 'Pesaje previo a venta.',
        ],
        [
            'animal_codigo' => 'AN-VACA-002',
            'fecha' => '2025-05-18',
            'peso' => 498.60,
            'observaciones' => 'Control reproductivo.',
        ],
    ];

    public function run(): void
    {
        foreach (self::PESAJES as $pesajeData) {
            $animal = Animal::query()
                ->where('codigo', $pesajeData['animal_codigo'])
                ->first();

            if (! $animal) {
                continue;
            }

            Pesaje::firstOrCreate(
                [
                    'animal_id' => $animal->id,
                    'fecha' => $pesajeData['fecha'],
                ],
                [
                    'peso' => $pesajeData['peso'],
                    'observaciones' => $pesajeData['observaciones'],
                ]
            );
        }
    }
}
