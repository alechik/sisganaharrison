<?php

namespace Database\Seeders;

use App\Models\TipoSalida;
use Illuminate\Database\Seeder;

class TipoSalidaSeeder extends Seeder
{
    /**
     * @var list<array{nombre: string, codigo: string, iniciales: string, descripcion: string, requiere_cliente: bool}>
     */
    public const TIPOS = [
        [
            'nombre' => 'Venta',
            'codigo' => 'VENTA',
            'iniciales' => 'V',
            'descripcion' => 'Salida de animales vendidos a un cliente.',
            'requiere_cliente' => true,
        ],
        [
            'nombre' => 'Pérdida',
            'codigo' => 'PERDIDA',
            'iniciales' => 'P',
            'descripcion' => 'Salida de animales perdidos.',
            'requiere_cliente' => false,
        ],
        [
            'nombre' => 'Robo',
            'codigo' => 'ROBO',
            'iniciales' => 'R',
            'descripcion' => 'Salida de animales por robo.',
            'requiere_cliente' => false,
        ],
        [
            'nombre' => 'Muerte',
            'codigo' => 'MUERTE',
            'iniciales' => 'M',
            'descripcion' => 'Salida de animales por muerte.',
            'requiere_cliente' => false,
        ],
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $tipo) {
            TipoSalida::withTrashed()->updateOrCreate(
                ['codigo' => $tipo['codigo']],
                [
                    'nombre' => $tipo['nombre'],
                    'iniciales' => $tipo['iniciales'],
                    'descripcion' => $tipo['descripcion'],
                    'requiere_cliente' => $tipo['requiere_cliente'],
                    'estado' => true,
                    'deleted_at' => null,
                ]
            );
        }
    }
}
