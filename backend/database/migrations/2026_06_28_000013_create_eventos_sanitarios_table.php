<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos_sanitarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')
                ->constrained('animales')
                ->restrictOnDelete();
            $table->foreignId('tipo_evento_id')
                ->constrained('tipos_eventos_sanitarios')
                ->restrictOnDelete();
            $table->foreignId('vacuna_id')
                ->nullable()
                ->constrained('vacunas')
                ->nullOnDelete();
            $table->date('fecha');
            $table->text('diagnostico')->nullable();
            $table->text('tratamiento')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('animal_id');
            $table->index('fecha');
            $table->index('tipo_evento_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos_sanitarios');
    }
};
