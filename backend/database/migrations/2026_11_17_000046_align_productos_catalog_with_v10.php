<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->renombrarPresentacionNombre();
        $this->migrarLaboratorioANombreCientifico();
        $this->exigirSubcategoriaProducto();
    }

    public function down(): void
    {
        if ($this->columnaEsNotNull('productos', 'subcategoria_producto_id')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropForeign(['subcategoria_producto_id']);
            });
            DB::statement('ALTER TABLE productos ALTER COLUMN subcategoria_producto_id DROP NOT NULL');
            Schema::table('productos', function (Blueprint $table) {
                $table->foreign('subcategoria_producto_id')
                    ->references('id')
                    ->on('subcategorias_productos')
                    ->restrictOnUpdate()
                    ->nullOnDelete();
            });
        }

        if (
            Schema::hasTable('productos')
            && Schema::hasColumn('productos', 'nombre_cientifico')
            && ! Schema::hasColumn('productos', 'laboratorio')
        ) {
            Schema::table('productos', function (Blueprint $table) {
                $table->string('laboratorio', 120)->nullable()->after('nombre');
            });
            DB::statement('UPDATE productos SET laboratorio = nombre_cientifico WHERE laboratorio IS NULL');
        }

        if (
            Schema::hasTable('presentaciones')
            && Schema::hasColumn('presentaciones', 'nombre')
            && ! Schema::hasColumn('presentaciones', 'descripcion')
        ) {
            Schema::table('presentaciones', function (Blueprint $table) {
                $table->renameColumn('nombre', 'descripcion');
            });
        }
    }

    private function renombrarPresentacionNombre(): void
    {
        if (
            ! Schema::hasTable('presentaciones')
            || ! Schema::hasColumn('presentaciones', 'descripcion')
            || Schema::hasColumn('presentaciones', 'nombre')
        ) {
            return;
        }

        Schema::table('presentaciones', function (Blueprint $table) {
            $table->renameColumn('descripcion', 'nombre');
        });
    }

    private function migrarLaboratorioANombreCientifico(): void
    {
        if (! Schema::hasTable('productos')) {
            return;
        }

        if (! Schema::hasColumn('productos', 'nombre_cientifico')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->string('nombre_cientifico', 120)->nullable()->after('nombre');
            });
        }

        if (Schema::hasColumn('productos', 'laboratorio')) {
            DB::statement(
                'UPDATE productos SET nombre_cientifico = laboratorio WHERE nombre_cientifico IS NULL AND laboratorio IS NOT NULL'
            );
            Schema::table('productos', function (Blueprint $table) {
                $table->dropColumn('laboratorio');
            });
        }
    }

    private function exigirSubcategoriaProducto(): void
    {
        if (! Schema::hasTable('productos') || ! Schema::hasTable('subcategorias_productos')) {
            return;
        }

        if (! Schema::hasColumn('productos', 'subcategoria_producto_id')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->foreignId('subcategoria_producto_id')
                    ->nullable()
                    ->constrained('subcategorias_productos')
                    ->restrictOnUpdate()
                    ->restrictOnDelete();
                $table->index('subcategoria_producto_id');
            });
        }

        $subcategoriaId = $this->fallbackSubcategoriaId();
        DB::table('productos')
            ->whereNull('subcategoria_producto_id')
            ->update(['subcategoria_producto_id' => $subcategoriaId]);

        if ($this->columnaEsNotNull('productos', 'subcategoria_producto_id')) {
            return;
        }

        Schema::table('productos', function (Blueprint $table) {
            $table->dropForeign(['subcategoria_producto_id']);
        });
        DB::statement('ALTER TABLE productos ALTER COLUMN subcategoria_producto_id SET NOT NULL');
        Schema::table('productos', function (Blueprint $table) {
            $table->foreign('subcategoria_producto_id')
                ->references('id')
                ->on('subcategorias_productos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
        });
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

    private function columnaEsNotNull(string $tabla, string $columna): bool
    {
        $row = DB::selectOne(
            'SELECT is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ? AND column_name = ?',
            [$tabla, $columna]
        );

        return $row !== null && strtoupper((string) $row->is_nullable) === 'NO';
    }
};
