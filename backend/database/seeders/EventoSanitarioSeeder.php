<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\EventoSanitario;
use App\Models\TipoEventoSanitario;
use App\Models\Vacuna;
use Illuminate\Database\Seeder;

class EventoSanitarioSeeder extends Seeder
{
    /**
     * Historial inicial de eventos sanitarios del rodeo.
     *
     * @var list<array<string, mixed>>
     */
    public const EVENTOS = [
        [
            'animal_codigo' => 'AN-VACA-001',
            'tipo_codigo' => 'VACUNACION',
            'vacuna_codigo' => 'AFTOSA',
            'fecha' => '2024-04-10',
            'diagnostico' => null,
            'tratamiento' => 'Aplicación de vacuna antiaftosa según calendario oficial.',
            'observaciones' => 'Campana de vacunación obligatoria.',
        ],
        [
            'animal_codigo' => 'AN-VACA-002',
            'tipo_codigo' => 'VACUNACION',
            'vacuna_codigo' => 'BRUCELOSIS',
            'fecha' => '2024-05-15',
            'diagnostico' => null,
            'tratamiento' => 'Vacuna antibrucelosis RB51.',
            'observaciones' => 'Hembra en edad reproductiva.',
        ],
        [
            'animal_codigo' => 'AN-NOV-001',
            'tipo_codigo' => 'DESPARASITACION',
            'vacuna_codigo' => null,
            'fecha' => '2024-07-01',
            'diagnostico' => 'Presencia de parásitos gastrointestinales.',
            'tratamiento' => 'Ivermectina 1% subcutánea.',
            'observaciones' => 'Control rutinario en lote de engorde.',
        ],
        [
            'animal_codigo' => 'AN-TORO-001',
            'tipo_codigo' => 'DIAGNOSTICO',
            'vacuna_codigo' => null,
            'fecha' => '2024-08-20',
            'diagnostico' => 'Condición corporal adecuada para servicio.',
            'tratamiento' => null,
            'observaciones' => 'Evaluación previa a temporada reproductiva.',
        ],
        [
            'animal_codigo' => 'AN-VACA-003',
            'tipo_codigo' => 'TRATAMIENTO',
            'vacuna_codigo' => null,
            'fecha' => '2024-09-05',
            'diagnostico' => 'Mastitis subclínica leve.',
            'tratamiento' => 'Antibiótico intramamario por 3 días.',
            'observaciones' => 'Seguimiento en ordeñe posterior.',
        ],
        [
            'animal_codigo' => 'AN-TER-001',
            'tipo_codigo' => 'VACUNACION',
            'vacuna_codigo' => 'CLOSTRIDIOSIS',
            'fecha' => '2025-03-01',
            'diagnostico' => null,
            'tratamiento' => 'Vacuna anticlostridial de refuerzo.',
            'observaciones' => 'Ternera en recría.',
        ],
        [
            'animal_codigo' => 'AN-NOV-002',
            'tipo_codigo' => 'ENFERMEDAD',
            'vacuna_codigo' => null,
            'fecha' => '2025-04-12',
            'diagnostico' => 'Fiebre y decaimiento leve.',
            'tratamiento' => 'Antipirético y fluidoterapia.',
            'observaciones' => 'Recuperación favorable en 48 horas.',
        ],
        [
            'animal_codigo' => 'AN-VACA-001',
            'tipo_codigo' => 'VACUNACION',
            'vacuna_codigo' => 'IBR_BVD',
            'fecha' => '2025-05-20',
            'diagnostico' => null,
            'tratamiento' => 'Refuerzo IBR-BVD.',
            'observaciones' => 'Esquema reproductivo del rodeo lechero.',
        ],
        [
            'animal_codigo' => 'AN-TER-002',
            'tipo_codigo' => 'CIRUGIA',
            'vacuna_codigo' => null,
            'fecha' => '2025-06-10',
            'diagnostico' => 'Quiste cutáneo en región cervical.',
            'tratamiento' => 'Extirpación quirúrgica menor.',
            'observaciones' => 'Curación por segunda intención.',
        ],
        [
            'animal_codigo' => 'AN-NOV-001',
            'tipo_codigo' => 'VACUNACION',
            'vacuna_codigo' => 'CARBUNCLO',
            'fecha' => '2025-07-01',
            'diagnostico' => null,
            'tratamiento' => 'Vacuna anticarbuncolosa anual.',
            'observaciones' => 'Prevención en zona endémica.',
        ],
    ];

    public function run(): void
    {
        foreach (self::EVENTOS as $eventoData) {
            $animal = Animal::query()->where('codigo', $eventoData['animal_codigo'])->first();
            $tipo = TipoEventoSanitario::query()->where('codigo', $eventoData['tipo_codigo'])->first();

            if (! $animal || ! $tipo) {
                continue;
            }

            $vacunaId = null;
            if (! empty($eventoData['vacuna_codigo'])) {
                $vacuna = Vacuna::query()->where('codigo', $eventoData['vacuna_codigo'])->first();
                $vacunaId = $vacuna?->id;
            }

            EventoSanitario::firstOrCreate(
                [
                    'animal_id' => $animal->id,
                    'tipo_evento_id' => $tipo->id,
                    'fecha' => $eventoData['fecha'],
                ],
                [
                    'vacuna_id' => $vacunaId,
                    'diagnostico' => $eventoData['diagnostico'],
                    'tratamiento' => $eventoData['tratamiento'],
                    'observaciones' => $eventoData['observaciones'],
                ]
            );
        }
    }
}
