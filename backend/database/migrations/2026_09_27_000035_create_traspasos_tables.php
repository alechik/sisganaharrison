<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('traspasos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('lote_salida_id')
                ->constrained('lotes')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('lote_ingreso_id')
                ->constrained('lotes')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->date('fecha_traspaso');
            $table->text('observacion')->nullable();
            $table->decimal('total_peso', 8, 2);
            $table->decimal('monto_total', 8, 2);
            $table->timestamps();

            $table->index('user_id');
            $table->index('lote_salida_id');
            $table->index('lote_ingreso_id');
            $table->index('fecha_traspaso');
        });

        DB::statement('ALTER TABLE traspasos ADD CONSTRAINT traspasos_lotes_distintos_chk CHECK (lote_salida_id <> lote_ingreso_id)');

        Schema::create('detalle_traspasos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('traspaso_id')
                ->constrained('traspasos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('animal_id')
                ->constrained('animales')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->unsignedInteger('cantidad');
            $table->decimal('peso', 8, 2);
            $table->decimal('precio', 8, 2);
            $table->decimal('subtotal', 8, 2);
            $table->timestamps();

            $table->index('traspaso_id');
            $table->index('animal_id');
            $table->unique(['traspaso_id', 'animal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_traspasos');
        Schema::dropIfExists('traspasos');
    }
};
