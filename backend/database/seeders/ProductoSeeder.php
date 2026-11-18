<?php

namespace Database\Seeders;

use App\Models\Producto;
use App\Models\Presentacion;
use App\Models\SubcategoriaProducto;
use Illuminate\Database\Seeder;
use RuntimeException;

class ProductoSeeder extends Seeder
{
    /**
     * @var list<array{
     *     codigo: string,
     *     nombre: string,
     *     nombre_cientifico: string|null,
     *     precio: float,
     *     descripcion: string,
     *     presentacion: string,
     *     categoria: string,
     *     subcategoria: string
     * }>
     */
    public const PRODUCTOS = [
        [
            'codigo' => 'AFTOSA',
            'nombre' => 'Vacuna Antiaftosa',
            'nombre_cientifico' => 'Aphthovirus',
            'precio' => 18.50,
            'descripcion' => 'Vacuna obligatoria contra la fiebre aftosa en bovinos.',
            'presentacion' => 'Frasco',
            'categoria' => 'Vacunas y prevención de enfermedades',
            'subcategoria' => 'Otras vacunas',
        ],
        [
            'codigo' => 'BRUCELOSIS',
            'nombre' => 'Vacuna Antibrucelosis',
            'nombre_cientifico' => 'Brucella abortus',
            'precio' => 22.00,
            'descripcion' => 'Prevención de brucelosis bovina mediante vacuna RB51 o equivalente.',
            'presentacion' => 'Frasco',
            'categoria' => 'Vacunas y prevención de enfermedades',
            'subcategoria' => 'Vacunas reproductivas',
        ],
        [
            'codigo' => 'CLOSTRIDIOSIS',
            'nombre' => 'Vacuna Anticlostridial',
            'nombre_cientifico' => 'Clostridium spp.',
            'precio' => 15.75,
            'descripcion' => 'Inmunización contra enterotoxemia y otras clostridiosis.',
            'presentacion' => 'Frasco',
            'categoria' => 'Vacunas y prevención de enfermedades',
            'subcategoria' => 'Vacunas clostridiales',
        ],
        [
            'codigo' => 'IVERMECTINA',
            'nombre' => 'Ivermectina 1%',
            'nombre_cientifico' => 'Ivermectin',
            'precio' => 12.30,
            'descripcion' => 'Antiparasitario interno y externo de amplio espectro.',
            'presentacion' => 'Inyectable',
            'categoria' => 'Antiparasitarios',
            'subcategoria' => 'Antiparasitarios internos',
        ],
        [
            'codigo' => 'OXITETRA',
            'nombre' => 'Oxitetraciclina LA',
            'nombre_cientifico' => 'Oxytetracycline',
            'precio' => 9.80,
            'descripcion' => 'Antibiótico de larga acción para infecciones bacterianas.',
            'presentacion' => 'Inyectable',
            'categoria' => 'Medicamentos veterinarios',
            'subcategoria' => 'Antibióticos',
        ],
        [
            'codigo' => 'DORAMECTINA',
            'nombre' => 'Doramectina Pour-on',
            'nombre_cientifico' => 'Doramectin',
            'precio' => 28.40,
            'descripcion' => 'Control de parásitos externos en aplicación pour-on.',
            'presentacion' => 'Pour-on',
            'categoria' => 'Antiparasitarios',
            'subcategoria' => 'Antiparasitarios combinados',
        ],
        [
            'codigo' => 'SEM_BRAHMAN',
            'nombre' => 'Semen Brahman',
            'nombre_cientifico' => 'Bos indicus (Brahman)',
            'precio' => 45.00,
            'descripcion' => 'Semen congelado de toro Brahman para inseminación artificial.',
            'presentacion' => 'Pajuela',
            'categoria' => 'Reproducción y maternidad',
            'subcategoria' => 'Semen de Bovino',
        ],
        [
            'codigo' => 'SEM_NELORE',
            'nombre' => 'Semen Nelore',
            'nombre_cientifico' => 'Bos indicus (Nelore)',
            'precio' => 42.00,
            'descripcion' => 'Semen congelado de toro Nelore para inseminación artificial.',
            'presentacion' => 'Pajuela',
            'categoria' => 'Reproducción y maternidad',
            'subcategoria' => 'Semen de Bovino',
        ],
        [
            'codigo' => 'SEM_ANGUS',
            'nombre' => 'Semen Angus',
            'nombre_cientifico' => 'Bos taurus (Angus)',
            'precio' => 55.00,
            'descripcion' => 'Semen congelado de toro Angus para inseminación artificial.',
            'presentacion' => 'Pajuela',
            'categoria' => 'Reproducción y maternidad',
            'subcategoria' => 'Semen de Bovino',
        ],
    ];

    public function run(): void
    {
        foreach (self::PRODUCTOS as $item) {
            $presentacion = Presentacion::query()->updateOrCreate(
                ['nombre' => $item['presentacion']]
            );

            $subcategoria = SubcategoriaProducto::query()
                ->where('nombre', $item['subcategoria'])
                ->whereHas('categoria', fn ($query) => $query->where('nombre', $item['categoria']))
                ->first();

            if (! $subcategoria) {
                throw new RuntimeException(
                    "No existe la subcategoría '{$item['subcategoria']}' de '{$item['categoria']}' para el producto {$item['codigo']}."
                );
            }

            Producto::query()->updateOrCreate(
                ['codigo' => $item['codigo']],
                [
                    'presentacion_id' => $presentacion->id,
                    'subcategoria_producto_id' => $subcategoria->id,
                    'nombre' => $item['nombre'],
                    'nombre_cientifico' => $item['nombre_cientifico'],
                    'precio' => $item['precio'],
                    'descripcion' => $item['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
