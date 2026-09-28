<?php

namespace Database\Seeders;

use App\Models\Medicamento;
use App\Models\Presentacion;
use Illuminate\Database\Seeder;

class MedicamentoSeeder extends Seeder
{
    /**
     * @var list<array{codigo: string, nombre: string, laboratorio: string|null, precio: float, descripcion: string, presentacion: string}>
     */
    public const MEDICAMENTOS = [
        [
            'codigo' => 'AFTOSA',
            'nombre' => 'Vacuna Antiaftosa',
            'laboratorio' => 'Senacsa / INTA',
            'precio' => 18.50,
            'descripcion' => 'Vacuna obligatoria contra la fiebre aftosa en bovinos.',
            'presentacion' => 'Frasco',
        ],
        [
            'codigo' => 'BRUCELOSIS',
            'nombre' => 'Vacuna Antibrucelosis',
            'laboratorio' => 'Biogenesis Bago',
            'precio' => 22.00,
            'descripcion' => 'Prevención de brucelosis bovina mediante vacuna RB51 o equivalente.',
            'presentacion' => 'Frasco',
        ],
        [
            'codigo' => 'CLOSTRIDIOSIS',
            'nombre' => 'Vacuna Anticlostridial',
            'laboratorio' => 'Zoetis',
            'precio' => 15.75,
            'descripcion' => 'Inmunización contra enterotoxemia y otras clostridiosis.',
            'presentacion' => 'Frasco',
        ],
        [
            'codigo' => 'IVERMECTINA',
            'nombre' => 'Ivermectina 1%',
            'laboratorio' => 'Zoetis',
            'precio' => 12.30,
            'descripcion' => 'Antiparasitario interno y externo de amplio espectro.',
            'presentacion' => 'Inyectable',
        ],
        [
            'codigo' => 'OXITETRA',
            'nombre' => 'Oxitetraciclina LA',
            'laboratorio' => 'MSD Salud Animal',
            'precio' => 9.80,
            'descripcion' => 'Antibiótico de larga acción para infecciones bacterianas.',
            'presentacion' => 'Inyectable',
        ],
        [
            'codigo' => 'DORAMECTINA',
            'nombre' => 'Doramectina Pour-on',
            'laboratorio' => 'Zoetis',
            'precio' => 28.40,
            'descripcion' => 'Control de parásitos externos en aplicación pour-on.',
            'presentacion' => 'Pour-on',
        ],
    ];

    public function run(): void
    {
        foreach (self::MEDICAMENTOS as $item) {
            $presentacion = Presentacion::firstOrCreate(
                ['descripcion' => $item['presentacion']]
            );

            Medicamento::firstOrCreate(
                ['codigo' => $item['codigo']],
                [
                    'presentacion_id' => $presentacion->id,
                    'nombre' => $item['nombre'],
                    'laboratorio' => $item['laboratorio'],
                    'precio' => $item['precio'],
                    'descripcion' => $item['descripcion'],
                    'activo' => true,
                ]
            );
        }
    }
}
