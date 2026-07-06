<?php

namespace Database\Seeders;

use App\Models\TipoMovimiento;
use Illuminate\Database\Seeder;

class TipoMovimientoSeeder extends Seeder
{
    /**
     * Catálogo inicial de tipos de movimiento.
     *
     * @var list<array{codigo: string, nombre: string, descripcion: string}>
     */
    public const TIPOS = [
        [
            'codigo' => 'TRASLADO',
            'nombre' => 'Traslado',
            'descripcion' => 'Movimiento de animales entre potreros, lotes o establecimientos.',
        ],
        [
            'codigo' => 'COMPRA',
            'nombre' => 'Compra',
            'descripcion' => 'Ingreso de animales por adquisición o compra.',
        ],
        [
            'codigo' => 'VENTA',
            'nombre' => 'Venta',
            'descripcion' => 'Salida de animales por venta o comercialización.',
        ],
        [
            'codigo' => 'NACIMIENTO',
            'nombre' => 'Nacimiento',
            'descripcion' => 'Registro de ingreso de animales por nacimiento en el rodeo.',
        ],
        [
            'codigo' => 'MUERTE',
            'nombre' => 'Muerte',
            'descripcion' => 'Baja del rodeo por fallecimiento del animal.',
        ],
        [
            'codigo' => 'BAJA',
            'nombre' => 'Baja',
            'descripcion' => 'Salida definitiva del inventario por motivos administrativos u otros.',
        ],
    ];

    public function run(): void
    {
        foreach (self::TIPOS as $tipo) {
            TipoMovimiento::firstOrCreate(
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
