<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_pesajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesaje_id')
                ->constrained('pesajes')
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
            $table->decimal('peso', 8, 2);
            $table->timestamps();

            $table->index('pesaje_id');
            $table->index('animal_id');
            $table->index('lote_id');
            $table->unique(['pesaje_id', 'animal_id']);
        });

        Schema::table('pesajes', function (Blueprint $table) {
            $table->string('codigo_pesaje', 20)->nullable();
            $table->date('fecha_pesaje')->nullable();
            $table->decimal('total_peso', 8, 2)->nullable();
            $table->text('observacion')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        $defaultUserId = DB::table('users')->orderBy('id')->value('id');
        $year = (int) now()->year;
        $secuencia = 1;

        foreach (DB::table('pesajes')->orderBy('id')->get() as $row) {
            $animal = DB::table('animales')->where('id', $row->animal_id)->first();
            $codigo = 'PES-'.$year.'-'.str_pad((string) $secuencia, 4, '0', STR_PAD_LEFT);
            $secuencia++;

            DB::table('pesajes')->where('id', $row->id)->update([
                'codigo_pesaje' => $codigo,
                'fecha_pesaje' => $row->fecha,
                'total_peso' => $row->peso,
                'observacion' => $row->observaciones,
                'user_id' => $animal->user_id ?? $defaultUserId,
                'updated_at' => $row->created_at,
            ]);

            DB::table('detalle_pesajes')->insert([
                'pesaje_id' => $row->id,
                'animal_id' => $row->animal_id,
                'lote_id' => $animal->lote_id ?? null,
                'peso' => $row->peso,
                'created_at' => $row->created_at,
                'updated_at' => $row->created_at,
            ]);
        }

        Schema::table('pesajes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('animal_id');
            $table->dropIndex(['fecha']);
            $table->dropColumn(['fecha', 'peso', 'observaciones']);
        });

        DB::statement('UPDATE pesajes SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1) WHERE user_id IS NULL');
        DB::statement('ALTER TABLE pesajes ALTER COLUMN codigo_pesaje SET NOT NULL');
        DB::statement('ALTER TABLE pesajes ALTER COLUMN fecha_pesaje SET NOT NULL');
        DB::statement('ALTER TABLE pesajes ALTER COLUMN total_peso SET NOT NULL');
        DB::statement('ALTER TABLE pesajes ALTER COLUMN user_id SET NOT NULL');

        Schema::table('pesajes', function (Blueprint $table) {
            $table->unique('codigo_pesaje');
            $table->index('fecha_pesaje');
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pesajes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreignId('animal_id')
                ->nullable()
                ->constrained('animales')
                ->restrictOnDelete();
            $table->date('fecha')->nullable();
            $table->decimal('peso', 8, 2)->nullable();
            $table->text('observaciones')->nullable();
        });

        foreach (DB::table('detalle_pesajes')->orderBy('id')->get() as $detalle) {
            $pesaje = DB::table('pesajes')->where('id', $detalle->pesaje_id)->first();
            if (! $pesaje) {
                continue;
            }

            DB::table('pesajes')->where('id', $pesaje->id)->update([
                'animal_id' => $detalle->animal_id,
                'fecha' => $pesaje->fecha_pesaje,
                'peso' => $detalle->peso,
                'observaciones' => $pesaje->observacion,
            ]);
        }

        Schema::dropIfExists('detalle_pesajes');

        Schema::table('pesajes', function (Blueprint $table) {
            $table->dropUnique(['codigo_pesaje']);
            $table->dropIndex(['fecha_pesaje']);
            $table->dropColumn(['codigo_pesaje', 'fecha_pesaje', 'total_peso', 'observacion', 'user_id', 'updated_at']);
        });
    }
};
