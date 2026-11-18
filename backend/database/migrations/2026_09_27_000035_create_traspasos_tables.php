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
            $table->foreignId('potrero_salida_id')
                ->constrained('potreros')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('potrero_ingreso_id')
                ->constrained('potreros')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->date('fecha_traspaso');
            $table->text('observacion')->nullable();
            $table->decimal('total_peso', 8, 2);
            $table->decimal('monto_total', 8, 2);
            $table->timestamps();

            $table->index('user_id');
            $table->index('potrero_salida_id');
            $table->index('potrero_ingreso_id');
            $table->index('fecha_traspaso');
        });

        DB::statement('ALTER TABLE traspasos ADD CONSTRAINT traspasos_potreros_distintos_chk CHECK (potrero_salida_id <> potrero_ingreso_id)');

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
