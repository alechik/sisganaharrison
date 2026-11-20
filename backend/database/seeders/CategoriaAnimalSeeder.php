<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\CategoriaAnimal;
use App\Support\CategoriaAnimalReglas;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CategoriaAnimalSeeder extends Seeder
{
    /**
     * Códigos antiguos cuyo ID se reutiliza al renombrar al catálogo nuevo.
     *
     * @var array<string, string>
     */
    private const RENAME_FROM = [
        'TERNEROS_M' => 'TERNERO',
        'TERNEROS_H' => 'TERNERA',
        'NOVILLOS' => 'NOVILLO',
        'VAQUILLAS' => 'NOVILLA',
        'TOROS' => 'TORO',
        'VACAS' => 'VACA',
    ];

    /**
     * Categorías antiguas que se reasignan a un código nuevo y quedan inactivas.
     *
     * @var array<string, string>
     */
    private const REASSIGN = [
        'VAQUILLONA' => 'VAQUILLAS',
        'REPRODUCTOR' => 'TOROS',
        'REPRODUCTORA' => 'VACAS',
    ];

    public function run(): void
    {
        foreach (CategoriaAnimalReglas::catalogo() as $codigo => $regla) {
            $existente = CategoriaAnimal::withTrashed()->where('codigo', $codigo)->first();

            if (! $existente && isset(self::RENAME_FROM[$codigo])) {
                $existente = CategoriaAnimal::withTrashed()
                    ->where('codigo', self::RENAME_FROM[$codigo])
                    ->first();
            }

            $payload = array_merge(
                ['codigo' => $codigo],
                CategoriaAnimalReglas::atributosPersistibles($regla)
            );

            if ($existente) {
                $existente->fill($payload)->save();
            } else {
                CategoriaAnimal::query()->create($payload);
            }
        }

        $this->reasignarPorSexo('TERNEROS', 'TERNEROS_M', 'TERNEROS_H');
        $this->reasignarPorSexo('DESTETES', 'DESTETES_M', 'DESTETES_H');

        foreach (self::REASSIGN as $codigoOrigen => $codigoDestino) {
            $origen = CategoriaAnimal::withTrashed()->where('codigo', $codigoOrigen)->first();
            $destino = CategoriaAnimal::withTrashed()->where('codigo', $codigoDestino)->first();
            if (! $origen || ! $destino || $origen->id === $destino->id) {
                continue;
            }
            $this->moverAnimalesYDetalles($origen->id, $destino->id);
            $origen->activo = false;
            $origen->save();
        }
    }

    private function reasignarPorSexo(string $origenCodigo, string $machoCodigo, string $hembraCodigo): void
    {
        $origen = CategoriaAnimal::withTrashed()->where('codigo', $origenCodigo)->first();
        $macho = CategoriaAnimal::withTrashed()->where('codigo', $machoCodigo)->first();
        $hembra = CategoriaAnimal::withTrashed()->where('codigo', $hembraCodigo)->first();

        if (! $origen || ! $macho || ! $hembra) {
            return;
        }

        Animal::withTrashed()
            ->where('categoria_id', $origen->id)
            ->where('sexo', 'M')
            ->update(['categoria_id' => $macho->id]);

        Animal::withTrashed()
            ->where('categoria_id', $origen->id)
            ->where('sexo', 'H')
            ->update(['categoria_id' => $hembra->id]);

        $origen->activo = false;
        $origen->save();
    }

    private function moverAnimalesYDetalles(int $origenId, int $destinoId): void
    {
        Animal::withTrashed()
            ->where('categoria_id', $origenId)
            ->update(['categoria_id' => $destinoId]);

        $this->moverDetallesComerciales($origenId, $destinoId);
    }

    private function moverDetallesComerciales(int $origenId, int $destinoId): void
    {
        $tablas = [
            'detalle_orden_compra',
            'cuarentena_detalle',
            'detalle_ingresos',
        ];

        foreach ($tablas as $tabla) {
            if (! Schema::hasTable($tabla) || ! Schema::hasColumn($tabla, 'categoria_animal_id')) {
                continue;
            }

            DB::table($tabla)
                ->where('categoria_animal_id', $origenId)
                ->update(['categoria_animal_id' => $destinoId]);
        }
    }
}
