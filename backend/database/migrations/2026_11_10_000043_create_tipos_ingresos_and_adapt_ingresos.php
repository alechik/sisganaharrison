<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_ingresos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('codigo', 20)->unique();
            $table->string('iniciales', 10);
            $table->text('descripcion')->nullable();
            $table->boolean('requiere_proveedor')->default(false);
            $table->boolean('estado')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique('iniciales');
            $table->index('estado');
            $table->index('nombre');
        });

        $now = now();
        $catalogo = [
            ['nombre' => 'Compra', 'codigo' => 'COMPRA', 'iniciales' => 'CO', 'descripcion' => 'Ingreso de animales adquiridos a un proveedor.', 'requiere_proveedor' => true],
            ['nombre' => 'Regalo', 'codigo' => 'REGALO', 'iniciales' => 'RE', 'descripcion' => 'Ingreso de animales recibidos como regalo.', 'requiere_proveedor' => false],
            ['nombre' => 'Dotación', 'codigo' => 'DOTACION', 'iniciales' => 'DO', 'descripcion' => 'Ingreso de animales por dotación institucional.', 'requiere_proveedor' => false],
            ['nombre' => 'Encontrado', 'codigo' => 'ENCONTRADO', 'iniciales' => 'EN', 'descripcion' => 'Ingreso de animales encontrados.', 'requiere_proveedor' => false],
            ['nombre' => 'Otros', 'codigo' => 'OTROS', 'iniciales' => 'OT', 'descripcion' => 'Ingreso de animales por un motivo no catalogado.', 'requiere_proveedor' => false],
        ];

        foreach ($catalogo as $tipo) {
            DB::table('tipos_ingresos')->insert([
                ...$tipo,
                'estado' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::table('ingresos', function (Blueprint $table) {
            $table->dropForeign(['proveedor_id']);
            $table->dropForeign(['cuarentena_id']);
        });

        DB::statement('ALTER TABLE ingresos ALTER COLUMN proveedor_id DROP NOT NULL');
        DB::statement('ALTER TABLE ingresos ALTER COLUMN cuarentena_id DROP NOT NULL');

        Schema::table('ingresos', function (Blueprint $table) {
            $table->foreign('proveedor_id')
                ->references('id')
                ->on('personas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreign('cuarentena_id')
                ->references('id')
                ->on('cuarentenas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('tipo_ingreso_id')
                ->nullable()
                ->after('cuarentena_id')
                ->constrained('tipos_ingresos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->index('tipo_ingreso_id');
        });

        $compraId = DB::table('tipos_ingresos')->where('codigo', 'COMPRA')->value('id');
        if ($compraId) {
            DB::table('ingresos')->whereNull('tipo_ingreso_id')->update(['tipo_ingreso_id' => $compraId]);
        }

        DB::statement('ALTER TABLE ingresos ALTER COLUMN tipo_ingreso_id SET NOT NULL');
        DB::statement('ALTER TABLE ingresos ALTER COLUMN monto_total TYPE DECIMAL(10,2)');
    }

    public function down(): void
    {
        Schema::table('ingresos', function (Blueprint $table) {
            $table->dropForeign(['tipo_ingreso_id']);
            $table->dropColumn('tipo_ingreso_id');
        });

        Schema::dropIfExists('tipos_ingresos');
    }
};
