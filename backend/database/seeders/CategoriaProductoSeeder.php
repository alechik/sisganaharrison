<?php

namespace Database\Seeders;

use App\Models\CategoriaProducto;
use App\Models\Medicamento;
use App\Models\SubcategoriaProducto;
use Illuminate\Database\Seeder;

class CategoriaProductoSeeder extends Seeder
{
    /**
     * Catálogo inicial de categorías/subcategorías. No crea stock ni precios ficticios.
     *
     * @var array<string, list<string>>
     */
    public const CLASIFICACION = [
        'Cuidado neonatal y crianza de terneros' => [
            'Calostros y sustitutos lácteos',
            'Leche y lactoreemplazantes',
            'Suplementos para terneros',
            'Desinfectantes para ombligo',
            'Biberones y mamaderas',
            'Productos para diarrea neonatal',
        ],
        'Vacunas y prevención de enfermedades' => [
            'Vacunas clostridiales',
            'Vacunas respiratorias',
            'Vacunas reproductivas',
            'Otras vacunas',
            'Diluyentes y material de aplicación',
        ],
        'Antiparasitarios' => [
            'Antiparasitarios internos',
            'Garrapaticidas',
            'Mosquicidas y repelentes',
            'Productos contra piojos y ácaros',
            'Antiparasitarios combinados',
        ],
        'Medicamentos veterinarios' => [
            'Antibióticos',
            'Antiinflamatorios y analgésicos',
            'Antipiréticos',
            'Antidiarreicos',
            'Rehidratantes y electrolitos',
            'Vitaminas y minerales terapéuticos',
            'Antisépticos y cicatrizantes',
            'Medicamentos específicos',
        ],
        'Alimentación y nutrición' => [
            'Balanceados iniciadores',
            'Balanceados de crecimiento',
            'Alimentos para engorde',
            'Forrajes y heno',
            'Ensilajes',
            'Sales minerales',
            'Suplementos proteicos y energéticos',
            'Bloques nutricionales',
            'Suplementos vitamínicos orales',
        ],
        'Reproducción y maternidad' => [
            'Productos reproductivos',
            'Semen bovino',
            'Hormonas reproductivas',
            'Catéteres y fundas de inseminación',
            'Lubricantes obstétricos',
            'Material para atención del parto',
            'Productos posparto',
        ],
        'Higiene, desinfección y cuidado corporal' => [
            'Desinfectantes de instalaciones',
            'Jabones y detergentes',
            'Higiene de ubres',
            'Selladores de pezones',
            'Productos para pezuñas',
            'Repelentes ambientales',
            'Productos de limpieza',
        ],
        'Insumos y materiales veterinarios' => [
            'Jeringas y agujas',
            'Guantes y protección',
            'Catéteres y sondas',
            'Gasas y vendas',
            'Aplicadores y dosificadores',
            'Aretes',
            'Frascos y accesorios de conservación',
        ],
    ];

    public const MAPA_MEDICAMENTOS = [
        'AFTOSA' => ['Vacunas y prevención de enfermedades', 'Otras vacunas'],
        'BRUCELOSIS' => ['Vacunas y prevención de enfermedades', 'Vacunas reproductivas'],
        'CLOSTRIDIOSIS' => ['Vacunas y prevención de enfermedades', 'Vacunas clostridiales'],
        'IVERMECTINA' => ['Antiparasitarios', 'Antiparasitarios internos'],
        'OXITETRA' => ['Medicamentos veterinarios', 'Antibióticos'],
        'DORAMECTINA' => ['Antiparasitarios', 'Antiparasitarios combinados'],
    ];

    public function run(): void
    {
        foreach (self::CLASIFICACION as $categoriaNombre => $subcategorias) {
            $categoria = CategoriaProducto::query()->firstOrCreate(
                ['nombre' => $categoriaNombre],
                ['activo' => true]
            );

            foreach ($subcategorias as $subNombre) {
                SubcategoriaProducto::query()->firstOrCreate(
                    [
                        'categoria_producto_id' => $categoria->id,
                        'nombre' => $subNombre,
                    ],
                    ['activo' => true]
                );
            }
        }

        $fallback = SubcategoriaProducto::query()
            ->whereHas('categoria', fn ($q) => $q->where('nombre', 'Medicamentos veterinarios'))
            ->where('nombre', 'Medicamentos específicos')
            ->first();

        foreach (self::MAPA_MEDICAMENTOS as $codigo => [$cat, $sub]) {
            $subcategoria = SubcategoriaProducto::query()
                ->where('nombre', $sub)
                ->whereHas('categoria', fn ($q) => $q->where('nombre', $cat))
                ->first();
            if (! $subcategoria) {
                continue;
            }
            Medicamento::query()->where('codigo', $codigo)->whereNull('subcategoria_producto_id')
                ->update(['subcategoria_producto_id' => $subcategoria->id]);
        }

        if ($fallback) {
            Medicamento::query()->whereNull('subcategoria_producto_id')
                ->update(['subcategoria_producto_id' => $fallback->id]);
        }
    }
}
