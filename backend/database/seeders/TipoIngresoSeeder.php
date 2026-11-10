<?php

namespace Database\Seeders;

use App\Models\TipoIngreso;
use Illuminate\Database\Seeder;

class TipoIngresoSeeder extends Seeder
{
    /**
     * @var list<array{nombre: string, codigo: string, iniciales: string, descripcion: string, requiere_proveedor: bool}>
     */
    public const TIPOS = [
        [
            'nombre' => 'Compra',
            'codigo' => 'COMPRA',
            'iniciales' => 'CO',
            'descripcion' => 'Ingreso de animales adquiridos a un proveedor.',
            'requiere_proveedor' => true,
        ],
        [
            'nombre' => 'Regalo',
            'codigo' => 'REGALO',
            'iniciales' => 'RE',
            'descripcion' => 'Ingreso de animales recibidos como regalo.',
            'requiere_proveedor' => false,
        ],
        [
            'nombre' => 'Dotación',
            'codigo' => 'DOTACION',
            'iniciales' => 'DO',
            'descripcion' => 'Ingreso de animales por dotación institucional.',
            'requiere_proveedor' => false,
        ],
        [
            'nombre' => 'Encontrado',
            'codigo' => 'ENCONTRADO',
            'iniciales' => 'EN',
            'descripcion' => 'Ingreso de animales encontrados.',
            'requiere_proveedor' => false,
        ],
        [
            'nombre' => 'Otros',
            'codigo' => 'OTROS',
            'iniciales' => 'OT',
            'descripcion' => 'Ingreso de animales por un motivo no catalogado.',
            'requiere_proveedor' => false,
        ],
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $tipo) {
            TipoIngreso::query()->updateOrCreate(
                ['codigo' => $tipo['codigo']],
                [
                    'nombre' => $tipo['nombre'],
                    'iniciales' => $tipo['iniciales'],
                    'descripcion' => $tipo['descripcion'],
                    'requiere_proveedor' => $tipo['requiere_proveedor'],
                    'estado' => true,
                ]
            );
        }
    }
}
