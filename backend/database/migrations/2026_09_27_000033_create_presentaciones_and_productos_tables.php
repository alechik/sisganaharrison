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
            $table->string('nombre', 50);
            $table->timestamps();
            $table->softDeletes();

            $table->unique('nombre');
        });

        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('presentacion_id')
                ->constrained('presentaciones')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->string('nombre_cientifico', 120)->nullable();
            $table->decimal('precio', 8, 2);
            $table->text('descripcion');
            $table->boolean('activo')->default(true);
            $table->decimal('cantidad_acumulada', 12, 2)->default(0);
            $table->decimal('valor_acumulado', 14, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('presentacion_id');
            $table->index('activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
        Schema::dropIfExists('presentaciones');
    }
};
