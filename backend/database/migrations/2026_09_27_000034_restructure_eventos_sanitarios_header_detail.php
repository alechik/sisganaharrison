<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $presentacionId = DB::table('presentaciones')->orderBy('id')->value('id');
        if (! $presentacionId) {
            $presentacionId = DB::table('presentaciones')->insertGetId([
                'descripcion' => 'Frasco',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $fallbackMedicamentoId = DB::table('medicamentos')->orderBy('id')->value('id');
        if (! $fallbackMedicamentoId) {
            $fallbackMedicamentoId = DB::table('medicamentos')->insertGetId([
                'presentacion_id' => $presentacionId,
                'codigo' => 'MED_MIGRACION',
                'nombre' => 'Medicamento de migración',
                'laboratorio' => null,
                'precio' => 0,
                'descripcion' => 'Registro temporal para migrar eventos sanitarios existentes.',
                'activo' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::create('detalle_eventos_sanitarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_sanitario_id')
                ->constrained('eventos_sanitarios')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('animal_id')
                ->constrained('animales')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('lote_id')
                ->nullable()
                ->constrained('lotes')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->foreignId('medicamento_id')
                ->constrained('medicamentos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->decimal('peso_animal', 8, 2);
            $table->decimal('precio_medicamento', 8, 2);
            $table->timestamps();

            $table->index('evento_sanitario_id');
            $table->index('animal_id');
            $table->index('lote_id');
            $table->index('medicamento_id');
            $table->unique(['evento_sanitario_id', 'animal_id']);
        });

        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable();
            $table->decimal('total', 10, 2)->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        $defaultUserId = DB::table('users')->orderBy('id')->value('id');
        $fallbackMedicamentoId = DB::table('medicamentos')->orderBy('id')->value('id');

        foreach (DB::table('eventos_sanitarios')->orderBy('id')->get() as $row) {
            $animal = DB::table('animales')->where('id', $row->animal_id)->first();
            $peso = DB::table('detalle_pesajes')
                ->where('animal_id', $row->animal_id)
                ->orderByDesc('id')
                ->value('peso');

            $medicamentoId = null;
            if (! empty($row->vacuna_id)) {
                $codigoVacuna = DB::table('vacunas')->where('id', $row->vacuna_id)->value('codigo');
                if ($codigoVacuna) {
                    $medicamentoId = DB::table('medicamentos')->where('codigo', $codigoVacuna)->value('id');
                }
            }
            $medicamentoId = $medicamentoId ?: $fallbackMedicamentoId;
            if (! $medicamentoId) {
                continue;
            }

            $precio = (float) (DB::table('medicamentos')->where('id', $medicamentoId)->value('precio') ?? 0);

            DB::table('eventos_sanitarios')->where('id', $row->id)->update([
                'user_id' => $animal->user_id ?? $defaultUserId,
                'total' => $precio,
                'updated_at' => $row->created_at,
            ]);

            DB::table('detalle_eventos_sanitarios')->insert([
                'evento_sanitario_id' => $row->id,
                'animal_id' => $row->animal_id,
                'lote_id' => $animal->lote_id ?? null,
                'medicamento_id' => $medicamentoId,
                'peso_animal' => $peso !== null ? $peso : 0,
                'precio_medicamento' => $precio,
                'created_at' => $row->created_at,
                'updated_at' => $row->created_at,
            ]);
        }

        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('animal_id');
            $table->dropConstrainedForeignId('vacuna_id');
        });

        DB::statement('UPDATE eventos_sanitarios SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1) WHERE user_id IS NULL');
        DB::statement("UPDATE eventos_sanitarios SET total = 0 WHERE total IS NULL");
        DB::statement('ALTER TABLE eventos_sanitarios ALTER COLUMN user_id SET NOT NULL');
        DB::statement('ALTER TABLE eventos_sanitarios ALTER COLUMN total SET NOT NULL');

        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreignId('animal_id')
                ->nullable()
                ->constrained('animales')
                ->restrictOnDelete();
            $table->foreignId('vacuna_id')
                ->nullable()
                ->constrained('vacunas')
                ->nullOnDelete();
        });

        foreach (DB::table('detalle_eventos_sanitarios')->orderBy('id')->get() as $detalle) {
            DB::table('eventos_sanitarios')->where('id', $detalle->evento_sanitario_id)->update([
                'animal_id' => $detalle->animal_id,
            ]);
        }

        Schema::dropIfExists('detalle_eventos_sanitarios');

        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'total', 'updated_at']);
        });
    }
};
