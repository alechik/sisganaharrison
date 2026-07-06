<?php

namespace Database\Seeders;

use App\Models\TipoAlerta;
use Illuminate\Database\Seeder;

class TipoAlertaSeeder extends Seeder
{
    /**
     * Catálogo inicial de tipos de alerta.
     *
     * @var list<array{codigo: string, nombre: string, descripcion: string}>
     */
    public const TIPOS = [
        [
            'codigo' => 'VACUNACION_PENDIENTE',
            'nombre' => 'Vacunación pendiente',
            'descripcion' => 'Alerta cuando un animal tiene una vacunación programada o vencida.',
        ],
        [
            'codigo' => 'PESO_BAJO',
            'nombre' => 'Peso bajo',
            'descripcion' => 'Alerta cuando el peso del animal está por debajo del umbral esperado.',
        ],
        [
            'codigo' => 'PARTO_PROXIMO',
            'nombre' => 'Parto próximo',
            'descripcion' => 'Alerta cuando se acerca la fecha estimada de parto.',
        ],
        [
            'codigo' => 'ANIMAL_ENFERMO',
            'nombre' => 'Animal enfermo',
            'descripcion' => 'Alerta por registro de enfermedad o condición clínica activa.',
        ],
        [
            'codigo' => 'SERVICIO_VENCIDO',
            'nombre' => 'Servicio vencido',
            'descripcion' => 'Alerta cuando un servicio reproductivo o sanitario ha vencido.',
        ],
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $tipo) {
            TipoAlerta::firstOrCreate(
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
