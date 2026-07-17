<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicios_reproductivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hembra_id')
                ->constrained('animales')
                ->restrictOnDelete();
            $table->foreignId('macho_id')
                ->nullable()
                ->constrained('animales')
                ->nullOnDelete();
            $table->date('fecha_servicio');
            $table->string('tipo_servicio', 30);
            $table->string('resultado', 30)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index('hembra_id');
            $table->index('macho_id');
            $table->index('fecha_servicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicios_reproductivos');
    }
};
