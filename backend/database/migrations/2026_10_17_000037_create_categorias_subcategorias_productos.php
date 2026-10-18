<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias_productos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('activo');
        });

        DB::statement(
            'CREATE UNIQUE INDEX categorias_productos_nombre_unique ON categorias_productos (lower(nombre)) WHERE deleted_at IS NULL'
        );

        Schema::create('subcategorias_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_producto_id')
                ->constrained('categorias_productos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('nombre', 120);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('categoria_producto_id');
            $table->index('activo');
        });

        DB::statement(
            'CREATE UNIQUE INDEX subcategorias_productos_categoria_nombre_unique ON subcategorias_productos (categoria_producto_id, lower(nombre)) WHERE deleted_at IS NULL'
        );

        Schema::table('medicamentos', function (Blueprint $table) {
            $table->foreignId('subcategoria_producto_id')
                ->nullable()
                ->constrained('subcategorias_productos')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->string('nombre_cientifico', 120)->nullable();
            $table->decimal('cantidad_acumulada', 12, 2)->default(0);
            $table->decimal('valor_acumulado', 14, 2)->default(0);
            $table->index('subcategoria_producto_id');
        });
    }

    public function down(): void
    {
        Schema::table('medicamentos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subcategoria_producto_id');
            $table->dropColumn(['nombre_cientifico', 'cantidad_acumulada', 'valor_acumulado']);
        });
        Schema::dropIfExists('subcategorias_productos');
        Schema::dropIfExists('categorias_productos');
    }
};
