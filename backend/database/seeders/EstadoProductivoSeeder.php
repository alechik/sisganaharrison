<?php

namespace Database\Seeders;

use App\Models\EstadoProductivo;
use Illuminate\Database\Seeder;

class EstadoProductivoSeeder extends Seeder
{
    /**
     * Catálogo inicial de estados productivos bovinos.
     *
     * @var list<array{codigo: string, nombre: string, descripcion: string}>
     */
    public const ESTADOS = [
        [
            'codigo' => 'PRODUCCION',
            'nombre' => 'Producción',
            'descripcion' => 'Animal en etapa activa de producción lechera o similar.',
        ],
        [
            'codigo' => 'ENGORDE',
            'nombre' => 'Engorde',
            'descripcion' => 'Animal destinado a la terminación y ganancia de peso para faena.',
        ],
        [
            'codigo' => 'REPRODUCCION',
            'nombre' => 'Reproducción',
            'descripcion' => 'Animal en servicio reproductivo o gestación activa.',
        ],
        [
            'codigo' => 'SECA',
            'nombre' => 'Seca',
            'descripcion' => 'Vaca en período de descanso productivo entre lactancias.',
        ],
        [
            'codigo' => 'RECRIA',
            'nombre' => 'Recría',
            'descripcion' => 'Animal joven en desarrollo previo a la etapa productiva o de engorde.',
        ],
        [
            'codigo' => 'PRE_SERVICIO',
            'nombre' => 'Pre-servicio',
            'descripcion' => 'Hembra preparada para ingresar al servicio reproductivo.',
        ],
        [
            'codigo' => 'LACTANCIA',
            'nombre' => 'Lactancia',
            'descripcion' => 'Vaca en producción de leche durante el ciclo lactacional.',
        ],
        [
            'codigo' => 'MANTENIMIENTO',
            'nombre' => 'Mantenimiento',
            'descripcion' => 'Animal en etapa de conservación sin objetivo productivo inmediato.',
        ],
    ];

    public function run(): void
    {
        foreach (self::ESTADOS as $estado) {
            EstadoProductivo::firstOrCreate(
                ['codigo' => $estado['codigo']],
                [
                    'nombre' => $estado['nombre'],
                    'descripcion' => $estado['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
