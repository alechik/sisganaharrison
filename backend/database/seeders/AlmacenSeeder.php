<?php

namespace Database\Seeders;

use App\Models\Almacen;
use App\Models\Estancia;
use Illuminate\Database\Seeder;

class AlmacenSeeder extends Seeder
{
    public function run(): void
    {
        Estancia::query()->whereNull('deleted_at')->each(function (Estancia $estancia) {
            Almacen::query()->firstOrCreate(
                ['estancia_id' => $estancia->id],
                [
                    'nombre' => 'Almacén '.$estancia->nombre,
                    'direccion' => $estancia->direccion,
                    'observacion' => 'Almacén principal de la estancia',
                    'activo' => true,
                ]
            );
        });
    }
}
