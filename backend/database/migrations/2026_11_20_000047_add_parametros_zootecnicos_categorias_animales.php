<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias_animales', function (Blueprint $table) {
            if (! Schema::hasColumn('categorias_animales', 'sexo')) {
                $table->char('sexo', 1)->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'edad_min_meses')) {
                $table->unsignedSmallInteger('edad_min_meses')->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'edad_max_meses')) {
                $table->unsignedSmallInteger('edad_max_meses')->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'castrado')) {
                $table->boolean('castrado')->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'caracteristica')) {
                $table->string('caracteristica', 255)->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'peso_min_kg')) {
                $table->decimal('peso_min_kg', 8, 2)->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'peso_max_kg')) {
                $table->decimal('peso_max_kg', 8, 2)->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'peso_referencia_meses')) {
                $table->unsignedSmallInteger('peso_referencia_meses')->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'cambio_peso_meses')) {
                $table->unsignedSmallInteger('cambio_peso_meses')->nullable();
            }
            if (! Schema::hasColumn('categorias_animales', 'indice_aumento')) {
                $table->decimal('indice_aumento', 8, 2)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('categorias_animales', function (Blueprint $table) {
            $columnas = [
                'sexo',
                'edad_min_meses',
                'edad_max_meses',
                'castrado',
                'caracteristica',
                'peso_min_kg',
                'peso_max_kg',
                'peso_referencia_meses',
                'cambio_peso_meses',
                'indice_aumento',
            ];
            $existentes = array_values(array_filter(
                $columnas,
                fn (string $columna) => Schema::hasColumn('categorias_animales', $columna)
            ));
            if ($existentes !== []) {
                $table->dropColumn($existentes);
            }
        });
    }
};
