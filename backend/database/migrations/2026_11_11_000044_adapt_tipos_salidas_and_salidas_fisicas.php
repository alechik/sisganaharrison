<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tipos_salidas', function (Blueprint $table) {
            $table->string('codigo', 20)->nullable()->after('nombre');
            $table->string('iniciales', 10)->nullable()->after('codigo');
            $table->text('descripcion')->nullable()->after('iniciales');
            $table->boolean('requiere_cliente')->default(false)->after('descripcion');
            $table->boolean('estado')->default(true)->after('requiere_cliente');
        });

        $now = now();
        $catalogo = [
            'Venta' => [
                'nombre' => 'Venta',
                'codigo' => 'VENTA',
                'iniciales' => 'V',
                'descripcion' => 'Salida de animales vendidos a un cliente.',
                'requiere_cliente' => true,
            ],
            'Perdido' => [
                'nombre' => 'Pérdida',
                'codigo' => 'PERDIDA',
                'iniciales' => 'P',
                'descripcion' => 'Salida de animales perdidos.',
                'requiere_cliente' => false,
            ],
            'Pérdida' => [
                'nombre' => 'Pérdida',
                'codigo' => 'PERDIDA',
                'iniciales' => 'P',
                'descripcion' => 'Salida de animales perdidos.',
                'requiere_cliente' => false,
            ],
            'Robo' => [
                'nombre' => 'Robo',
                'codigo' => 'ROBO',
                'iniciales' => 'R',
                'descripcion' => 'Salida de animales por robo.',
                'requiere_cliente' => false,
            ],
            'Muerte' => [
                'nombre' => 'Muerte',
                'codigo' => 'MUERTE',
                'iniciales' => 'M',
                'descripcion' => 'Salida de animales por muerte.',
                'requiere_cliente' => false,
            ],
        ];

        $existentes = DB::table('tipos_salidas')->get();
        foreach ($existentes as $tipo) {
            $datos = $catalogo[$tipo->nombre] ?? null;
            if ($datos === null) {
                $codigo = strtoupper((string) preg_replace('/[^A-Za-z0-9]+/', '_', (string) $tipo->nombre));
                $datos = [
                    'nombre' => $tipo->nombre,
                    'codigo' => ($codigo !== '' ? $codigo : 'T').$tipo->id,
                    'iniciales' => 'X'.$tipo->id,
                    'descripcion' => null,
                    'requiere_cliente' => false,
                ];
            }

            DB::table('tipos_salidas')->where('id', $tipo->id)->update([
                'nombre' => $datos['nombre'],
                'codigo' => $datos['codigo'],
                'iniciales' => $datos['iniciales'],
                'descripcion' => $datos['descripcion'],
                'requiere_cliente' => $datos['requiere_cliente'],
                'estado' => true,
                'updated_at' => $now,
            ]);
        }

        foreach ([
            ['Venta', 'VENTA', 'V', 'Salida de animales vendidos a un cliente.', true],
            ['Pérdida', 'PERDIDA', 'P', 'Salida de animales perdidos.', false],
            ['Robo', 'ROBO', 'R', 'Salida de animales por robo.', false],
            ['Muerte', 'MUERTE', 'M', 'Salida de animales por muerte.', false],
        ] as [$nombre, $codigo, $iniciales, $descripcion, $requiere]) {
            $existe = DB::table('tipos_salidas')->where('codigo', $codigo)->exists();
            if ($existe) {
                continue;
            }

            DB::table('tipos_salidas')->insert([
                'nombre' => $nombre,
                'codigo' => $codigo,
                'iniciales' => $iniciales,
                'descripcion' => $descripcion,
                'requiere_cliente' => $requiere,
                'estado' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::table('tipos_salidas', function (Blueprint $table) {
            $table->unique('codigo');
            $table->unique('iniciales');
            $table->index('estado');
        });

        DB::statement('ALTER TABLE tipos_salidas ALTER COLUMN codigo SET NOT NULL');
        DB::statement('ALTER TABLE tipos_salidas ALTER COLUMN iniciales SET NOT NULL');

        Schema::table('salidas', function (Blueprint $table) {
            $table->text('observaciones')->nullable()->after('monto_total');
        });

        Schema::table('detalle_salidas', function (Blueprint $table) {
            $table->text('observaciones')->nullable()->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_salidas', function (Blueprint $table) {
            $table->dropColumn('observaciones');
        });

        Schema::table('salidas', function (Blueprint $table) {
            $table->dropColumn('observaciones');
        });

        Schema::table('tipos_salidas', function (Blueprint $table) {
            $table->dropUnique(['codigo']);
            $table->dropUnique(['iniciales']);
            $table->dropIndex(['estado']);
            $table->dropColumn(['codigo', 'iniciales', 'descripcion', 'requiere_cliente', 'estado']);
        });
    }
};
