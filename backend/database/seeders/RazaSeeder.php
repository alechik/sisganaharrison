<?php

namespace Database\Seeders;

use App\Models\Raza;
use Illuminate\Database\Seeder;

class RazaSeeder extends Seeder
{
    /**
     * Catálogo inicial de razas bovinas para la región (Paraguay / Argentina).
     *
     * @var list<array{nombre: string, codigo: string, descripcion: string}>
     */
    public const RAZAS = [
        [
            'nombre' => 'Brahman',
            'codigo' => 'BRAHMAN',
            'descripcion' => 'Raza cebuina de origen indio-americano, muy adaptada al trópico y resistente a parásitos externos.',
        ],
        [
            'nombre' => 'Nelore',
            'codigo' => 'NELORE',
            'descripcion' => 'Variante brasileña del cebú, ampliamente utilizada en sistemas extensivos del Cono Sur.',
        ],
        [
            'nombre' => 'Angus',
            'codigo' => 'ANGUS',
            'descripcion' => 'Raza británica de carne, reconocida por la calidad de la canal y marmoleo.',
        ],
        [
            'nombre' => 'Hereford',
            'codigo' => 'HEREFORD',
            'descripcion' => 'Raza británica dual propósito, destacada por rusticidad y eficiencia en pastoreo.',
        ],
        [
            'nombre' => 'Brangus',
            'codigo' => 'BRANGUS',
            'descripcion' => 'Cruce Angus x Brahman (5/8 Angus, 3/8 Brahman), combina calidad cárnica y adaptabilidad.',
        ],
        [
            'nombre' => 'Criollo',
            'codigo' => 'CRIOLLO',
            'descripcion' => 'Raza nativa sudamericana, altamente adaptada a condiciones locales y bajo insumo.',
        ],
        [
            'nombre' => 'Holando Argentino',
            'codigo' => 'HOLANDO',
            'descripcion' => 'Raza lechera de origen europeo, base de la producción lechera regional.',
        ],
        [
            'nombre' => 'Senepol',
            'codigo' => 'SENEPOL',
            'descripcion' => 'Raza cebuina de las Islas Vírgenes, resistente al calor y de buena ganancia de peso.',
        ],
        [
            'nombre' => 'Charolais',
            'codigo' => 'CHAROLAIS',
            'descripcion' => 'Raza francesa de carne, utilizada en cruzamientos por su alto peso y conformación muscular.',
        ],
        [
            'nombre' => 'Pietrain',
            'codigo' => 'PIETRAIN',
            'descripcion' => 'Raza belga de carne, reconocida por su alta proporción de músculo y bajo depósito de grasa.',
        ],
    ];

    public function run(): void
    {
        foreach (self::RAZAS as $raza) {
            Raza::firstOrCreate(
                ['codigo' => $raza['codigo']],
                [
                    'nombre' => $raza['nombre'],
                    'descripcion' => $raza['descripcion'],
                    'estado' => true,
                ]
            );
        }
    }
}
