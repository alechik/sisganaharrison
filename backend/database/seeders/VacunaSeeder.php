<?php

namespace Database\Seeders;

use App\Models\Vacuna;
use Illuminate\Database\Seeder;

class VacunaSeeder extends Seeder
{
    /**
     * Catálogo inicial de vacunas ganaderas.
     *
     * @var list<array{codigo: string, nombre: string, laboratorio: string|null, descripcion: string}>
     */
    public const VACUNAS = [
        [
            'codigo' => 'AFTOSA',
            'nombre' => 'Vacuna Antiaftosa',
            'laboratorio' => 'Senacsa / INTA',
            'descripcion' => 'Vacuna obligatoria contra la fiebre aftosa en bovinos.',
        ],
        [
            'codigo' => 'BRUCELOSIS',
            'nombre' => 'Vacuna Antibrucelosis',
            'laboratorio' => 'Biogenesis Bago',
            'descripcion' => 'Prevención de brucelosis bovina mediante vacuna RB51 o equivalente.',
        ],
        [
            'codigo' => 'CARBUNCLO',
            'nombre' => 'Vacuna Anticarbuncolosa',
            'laboratorio' => 'Biogenesis Bago',
            'descripcion' => 'Protección contra carbunco bacteridiano (Ántrax).',
        ],
        [
            'codigo' => 'CLOSTRIDIOSIS',
            'nombre' => 'Vacuna Anticlostridial',
            'laboratorio' => 'Zoetis',
            'descripcion' => 'Inmunización contra enterotoxemia y otras clostridiosis.',
        ],
        [
            'codigo' => 'IBR_BVD',
            'nombre' => 'Vacuna IBR-BVD',
            'laboratorio' => 'Boehringer Ingelheim',
            'descripcion' => 'Control de rinotraqueítis infecciosa bovina y diarrea viral bovina.',
        ],
        [
            'codigo' => 'LEPTOSPIROSIS',
            'nombre' => 'Vacuna Antileptospirosis',
            'laboratorio' => 'MSD Salud Animal',
            'descripcion' => 'Prevención de leptospirosis en el rodeo.',
        ],
        [
            'codigo' => 'RABIA',
            'nombre' => 'Vacuna Antirrábica',
            'laboratorio' => 'Instituto Butantan',
            'descripcion' => 'Inmunización antirrábica en zonas de riesgo.',
        ],
        [
            'codigo' => 'TRICHOSTRONGILOSIS',
            'nombre' => 'Vacuna Antiparasitaria Trichostrongylus',
            'laboratorio' => 'Hipra',
            'descripcion' => 'Control de helmintos gastrointestinales del ganado.',
        ],
        [
            'codigo' => 'DERMATOFITOSIS',
            'nombre' => 'Vacuna Antidermatofitosis',
            'laboratorio' => 'Biogenesis Bago',
            'descripcion' => 'Prevención de dermatofitosis (tiña) en bovinos.',
        ],
        [
            'codigo' => 'REPRODUCTIVA',
            'nombre' => 'Vacuna Reproductiva Bovina',
            'laboratorio' => 'Zoetis',
            'descripcion' => 'Esquema reproductivo contra enfermedades que afectan fertilidad.',
        ],
    ];

    public function run(): void
    {
        foreach (self::VACUNAS as $vacuna) {
            Vacuna::firstOrCreate(
                ['codigo' => $vacuna['codigo']],
                [
                    'nombre' => $vacuna['nombre'],
                    'laboratorio' => $vacuna['laboratorio'],
                    'descripcion' => $vacuna['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
