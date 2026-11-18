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

        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('subcategoria_producto_id')
                ->nullable()
                ->constrained('subcategorias_productos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->index('subcategoria_producto_id');
        });

        $this->exigirSubcategoriaProducto();
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subcategoria_producto_id');
        });
        Schema::dropIfExists('subcategorias_productos');
        Schema::dropIfExists('categorias_productos');
    }

    private function exigirSubcategoriaProducto(): void
    {
        $subcategoriaId = $this->fallbackSubcategoriaId();

        DB::table('productos')
            ->whereNull('subcategoria_producto_id')
            ->update(['subcategoria_producto_id' => $subcategoriaId]);

        DB::statement('ALTER TABLE productos ALTER COLUMN subcategoria_producto_id SET NOT NULL');
    }

    private function fallbackSubcategoriaId(): int
    {
        $now = now();

        $categoriaId = DB::table('categorias_productos')
            ->whereRaw('lower(nombre) = ?', ['medicamentos veterinarios'])
            ->value('id');

        if (! $categoriaId) {
            $categoriaId = DB::table('categorias_productos')->insertGetId([
                'nombre' => 'Medicamentos veterinarios',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $subcategoriaId = DB::table('subcategorias_productos')
            ->where('categoria_producto_id', $categoriaId)
            ->whereRaw('lower(nombre) = ?', ['medicamentos específicos'])
            ->value('id');

        if (! $subcategoriaId) {
            $subcategoriaId = DB::table('subcategorias_productos')->insertGetId([
                'categoria_producto_id' => $categoriaId,
                'nombre' => 'Medicamentos específicos',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return (int) $subcategoriaId;
    }
};
