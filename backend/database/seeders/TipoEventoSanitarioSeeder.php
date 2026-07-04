<?php

namespace Database\Seeders;

use App\Models\TipoEventoSanitario;
use Illuminate\Database\Seeder;

class TipoEventoSanitarioSeeder extends Seeder
{
    /**
     * Catálogo inicial de tipos de eventos sanitarios.
     *
     * @var list<array{codigo: string, nombre: string, descripcion: string}>
     */
    public const TIPOS = [
        [
            'codigo' => 'VACUNACION',
            'nombre' => 'Vacunación',
            'descripcion' => 'Aplicación de vacunas para prevención de enfermedades.',
        ],
        [
            'codigo' => 'DESPARASITACION',
            'nombre' => 'Desparasitación',
            'descripcion' => 'Control de parásitos internos y externos del ganado.',
        ],
        [
            'codigo' => 'TRATAMIENTO',
            'nombre' => 'Tratamiento',
            'descripcion' => 'Administración de medicamentos o terapias veterinarias.',
        ],
        [
            'codigo' => 'ENFERMEDAD',
            'nombre' => 'Enfermedad',
            'descripcion' => 'Registro de diagnóstico o brote de enfermedad.',
        ],
        [
            'codigo' => 'CIRUGIA',
            'nombre' => 'Cirugía',
            'descripcion' => 'Procedimiento quirúrgico realizado al animal.',
        ],
        [
            'codigo' => 'DIAGNOSTICO',
            'nombre' => 'Diagnóstico',
            'descripcion' => 'Evaluación clínica o de laboratorio sin tratamiento aplicado.',
        ],
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $tipo) {
            TipoEventoSanitario::firstOrCreate(
                ['codigo' => $tipo['codigo']],
                [
                    'nombre' => $tipo['nombre'],
                    'descripcion' => $tipo['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
