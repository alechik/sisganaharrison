<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grupos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lote_id')
                ->constrained('lotes')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('nombre', 100);
            $table->text('observaciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('lote_id');
            $table->index('activo');
            $table->index('nombre');
        });

        DB::statement(
            'CREATE UNIQUE INDEX grupos_lote_nombre_unique ON grupos (lote_id, lower(nombre)) WHERE deleted_at IS NULL'
        );

        Schema::table('animales', function (Blueprint $table) {
            $table->foreignId('grupo_id')
                ->nullable()
                ->after('lote_id')
                ->constrained('grupos')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->index('grupo_id');
        });

        Schema::table('ingresos', function (Blueprint $table) {
            $table->foreignId('grupo_id')
                ->nullable()
                ->after('lote_id')
                ->constrained('grupos')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->index('grupo_id');
        });

        Schema::table('detalle_salidas', function (Blueprint $table) {
            $table->foreignId('grupo_id')
                ->nullable()
                ->after('lote_id')
                ->constrained('grupos')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->index('grupo_id');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_salidas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('grupo_id');
        });
        Schema::table('ingresos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('grupo_id');
        });
        Schema::table('animales', function (Blueprint $table) {
            $table->dropConstrainedForeignId('grupo_id');
        });
        Schema::dropIfExists('grupos');
    }
};
