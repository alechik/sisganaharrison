<?php

namespace Database\Seeders;

use App\Models\CategoriaAnimal;
use Illuminate\Database\Seeder;

class CategoriaAnimalSeeder extends Seeder
{
    /**
     * Catálogo inicial de categorías ganaderas.
     *
     * @var list<array{codigo: string, nombre: string, descripcion: string}>
     */
    public const CATEGORIAS = [
        [
            'codigo' => 'TERNERO',
            'nombre' => 'Ternero',
            'descripcion' => 'Macho bovino destetado, generalmente menor de 12 meses.',
        ],
        [
            'codigo' => 'TERNERA',
            'nombre' => 'Ternera',
            'descripcion' => 'Hembra bovina destetada, generalmente menor de 12 meses.',
        ],
        [
            'codigo' => 'NOVILLO',
            'nombre' => 'Novillo',
            'descripcion' => 'Macho joven en etapa de engorde, sin servicio reproductivo.',
        ],
        [
            'codigo' => 'NOVILLA',
            'nombre' => 'Novilla',
            'descripcion' => 'Hembra joven que aún no ha parido por primera vez.',
        ],
        [
            'codigo' => 'TORO',
            'nombre' => 'Toro',
            'descripcion' => 'Macho adulto apto para reproducción o servicio.',
        ],
        [
            'codigo' => 'VACA',
            'nombre' => 'Vaca',
            'descripcion' => 'Hembra adulta que ya ha parido al menos una vez.',
        ],
        [
            'codigo' => 'VAQUILLONA',
            'nombre' => 'Vaquillona',
            'descripcion' => 'Hembra joven próxima a la primera cría o en pre-servicio.',
        ],
        [
            'codigo' => 'REPRODUCTOR',
            'nombre' => 'Reproductor',
            'descripcion' => 'Macho seleccionado para mejoramiento genético del rodeo.',
        ],
        [
            'codigo' => 'REPRODUCTORA',
            'nombre' => 'Reproductora',
            'descripcion' => 'Hembra seleccionada para reproducción y continuidad del plantel.',
        ],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIAS as $categoria) {
            CategoriaAnimal::firstOrCreate(
                ['codigo' => $categoria['codigo']],
                [
                    'nombre' => $categoria['nombre'],
                    'descripcion' => $categoria['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
