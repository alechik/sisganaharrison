<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('informe_diarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_trabajador_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('codigo_informe', 20)->unique();
            $table->text('detalle_informe');
            $table->string('revisado', 2)->default('NO');
            $table->date('fecha');
            $table->date('fecha_revision')->nullable();
            $table->foreignId('user_revisor_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->timestamps();

            $table->index(['user_trabajador_id', 'fecha']);
            $table->index('user_revisor_id');
            $table->index('revisado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('informe_diarios');
    }
};
