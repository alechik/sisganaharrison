<?php

namespace Database\Seeders;

use App\Models\Almacen;
use App\Models\Establecimiento;
use Illuminate\Database\Seeder;

class AlmacenSeeder extends Seeder
{
    public function run(): void
    {
        Establecimiento::query()->whereNull('deleted_at')->each(function (Establecimiento $estancia) {
            Almacen::query()->firstOrCreate(
                ['establecimiento_id' => $estancia->id],
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
