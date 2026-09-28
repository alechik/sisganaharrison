<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presentaciones', function (Blueprint $table) {
            $table->id();
            $table->string('descripcion', 50);
            $table->timestamps();
            $table->softDeletes();

            $table->unique('descripcion');
        });

        Schema::create('medicamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('presentacion_id')
                ->constrained('presentaciones')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->string('laboratorio', 120)->nullable();
            $table->decimal('precio', 8, 2);
            $table->text('descripcion');
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('presentacion_id');
            $table->index('activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicamentos');
        Schema::dropIfExists('presentaciones');
    }
};
