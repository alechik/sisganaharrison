<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Models\EstadoProductivo;
use App\Models\Lote;
use App\Models\Raza;
use Illuminate\Database\Seeder;

class AnimalSeeder extends Seeder
{
    /**
     * Registro inicial de animales del rodeo.
     *
     * @var list<array<string, mixed>>
     */
    public const ANIMALES = [
        [
            'codigo' => 'AN-TORO-001',
            'arete' => 'AR-1001',
            'nombre' => 'Centurión',
            'sexo' => 'M',
            'fecha_nacimiento' => '2020-03-15',
            'raza_codigo' => 'BRAHMAN',
            'categoria_codigo' => 'TORO',
            'estado_codigo' => 'REPRODUCCION',
            'lote_codigo' => 'LOT_CARMEN_ENG',
            'madre_codigo' => null,
            'padre_codigo' => null,
            'color' => 'Gris',
            'observaciones' => 'Toro reproductor principal del lote norte.',
        ],
        [
            'codigo' => 'AN-VACA-001',
            'arete' => 'AR-2001',
            'nombre' => 'Estrella',
            'sexo' => 'H',
            'fecha_nacimiento' => '2019-08-22',
            'raza_codigo' => 'ANGUS',
            'categoria_codigo' => 'VACA',
            'estado_codigo' => 'PRODUCCION',
            'lote_codigo' => 'LOT_CARMEN_ENG',
            'madre_codigo' => null,
            'padre_codigo' => null,
            'color' => 'Negro',
            'observaciones' => 'Vaca de alta producción lechera.',
        ],
        [
            'codigo' => 'AN-VACA-002',
            'arete' => 'AR-2002',
            'nombre' => 'Paloma',
            'sexo' => 'H',
            'fecha_nacimiento' => '2021-01-10',
            'raza_codigo' => 'BRAHMAN',
            'categoria_codigo' => 'VACA',
            'estado_codigo' => 'REPRODUCCION',
            'lote_codigo' => 'LOT_CARMEN_CRIA',
            'madre_codigo' => null,
            'padre_codigo' => null,
            'color' => 'Colorado',
            'observaciones' => 'Vaca en servicio reproductivo.',
        ],
        [
            'codigo' => 'AN-NOV-001',
            'arete' => 'AR-3001',
            'nombre' => 'Trueno',
            'sexo' => 'M',
            'fecha_nacimiento' => '2023-06-05',
            'raza_codigo' => 'BRANGUS',
            'categoria_codigo' => 'NOVILLO',
            'estado_codigo' => 'ENGORDE',
            'lote_codigo' => 'LOT_SJ_A',
            'madre_codigo' => 'AN-VACA-001',
            'padre_codigo' => 'AN-TORO-001',
            'color' => 'Negro',
            'observaciones' => 'Novillo en etapa de engorde.',
        ],
        [
            'codigo' => 'AN-TER-001',
            'arete' => 'AR-4001',
            'nombre' => 'Luna',
            'sexo' => 'H',
            'fecha_nacimiento' => '2025-01-18',
            'raza_codigo' => 'BRAHMAN',
            'categoria_codigo' => 'TERNERA',
            'estado_codigo' => 'RECRIA',
            'lote_codigo' => 'LOT_CARMEN_CRIA',
            'madre_codigo' => 'AN-VACA-002',
            'padre_codigo' => 'AN-TORO-001',
            'color' => 'Gris',
            'observaciones' => 'Ternera en recría.',
        ],
        [
            'codigo' => 'AN-TER-002',
            'arete' => 'AR-4002',
            'nombre' => 'Rayo',
            'sexo' => 'M',
            'fecha_nacimiento' => '2025-02-20',
            'raza_codigo' => 'ANGUS',
            'categoria_codigo' => 'TERNERO',
            'estado_codigo' => 'RECRIA',
            'lote_codigo' => 'LOT_SJ_B',
            'madre_codigo' => 'AN-VACA-001',
            'padre_codigo' => 'AN-TORO-001',
            'color' => 'Negro',
            'observaciones' => 'Ternero destetado reciente.',
        ],
        [
            'codigo' => 'AN-NOV-002',
            'arete' => 'AR-3002',
            'nombre' => 'Cacique',
            'sexo' => 'M',
            'fecha_nacimiento' => '2022-11-30',
            'raza_codigo' => 'NELORE',
            'categoria_codigo' => 'NOVILLO',
            'estado_codigo' => 'ENGORDE',
            'lote_codigo' => 'LOT_HARR_ORO',
            'madre_codigo' => null,
            'padre_codigo' => null,
            'color' => 'Blanco',
            'observaciones' => 'Novillo adquirido para engorde.',
        ],
        [
            'codigo' => 'AN-VACA-003',
            'arete' => 'AR-2003',
            'nombre' => 'Miranda',
            'sexo' => 'H',
            'fecha_nacimiento' => '2020-05-12',
            'raza_codigo' => 'HOLANDO',
            'categoria_codigo' => 'VACA',
            'estado_codigo' => 'SECA',
            'lote_codigo' => 'LOT_PROG_01',
            'madre_codigo' => null,
            'padre_codigo' => null,
            'color' => 'Blanco y negro',
            'observaciones' => 'Vaca en período seco.',
        ],
    ];

    public function run(): void
    {
        $created = [];

        foreach (self::ANIMALES as $animalData) {
            $raza = Raza::query()->where('codigo', $animalData['raza_codigo'])->first();
            $categoria = CategoriaAnimal::query()->where('codigo', $animalData['categoria_codigo'])->first();
            $estado = EstadoProductivo::query()->where('codigo', $animalData['estado_codigo'])->first();
            $lote = Lote::query()->where('codigo', $animalData['lote_codigo'])->first();

            if (! $raza || ! $categoria || ! $estado || ! $lote) {
                continue;
            }

            $madreId = null;
            if (! empty($animalData['madre_codigo']) && isset($created[$animalData['madre_codigo']])) {
                $madreId = $created[$animalData['madre_codigo']];
            }

            $padreId = null;
            if (! empty($animalData['padre_codigo']) && isset($created[$animalData['padre_codigo']])) {
                $padreId = $created[$animalData['padre_codigo']];
            }

            $animal = Animal::firstOrCreate(
                ['codigo' => $animalData['codigo']],
                [
                    'arete' => $animalData['arete'],
                    'nombre' => $animalData['nombre'],
                    'sexo' => $animalData['sexo'],
                    'fecha_nacimiento' => $animalData['fecha_nacimiento'],
                    'raza_id' => $raza->id,
                    'categoria_id' => $categoria->id,
                    'estado_productivo_id' => $estado->id,
                    'lote_id' => $lote->id,
                    'madre_id' => $madreId,
                    'padre_id' => $padreId,
                    'color' => $animalData['color'],
                    'observaciones' => $animalData['observaciones'],
                    'activo' => true,
                ]
            );

            $created[$animalData['codigo']] = $animal->id;
        }
    }
}
