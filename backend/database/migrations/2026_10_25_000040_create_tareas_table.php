<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_gerencia_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_trabajador_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('codigo_tarea', 20)->unique();
            $table->text('indicacion');
            $table->text('respuesta_indicacion')->nullable();
            $table->string('visto', 2)->default('NO');
            $table->string('estado', 20)->default('EMITIDO');
            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_fin')->nullable();
            $table->timestamps();

            $table->index('user_gerencia_id');
            $table->index('user_trabajador_id');
            $table->index('estado');
            $table->index('fecha_inicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tareas');
    }
};
