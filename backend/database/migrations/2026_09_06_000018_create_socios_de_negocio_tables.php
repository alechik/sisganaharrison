<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->timestamps();
        });

        Schema::create('personas', function (Blueprint $table) {
            $table->id();
            $table->string('razon_social', 255);
            $table->string('responsable', 255)->nullable();
            $table->string('email', 255)->nullable()->unique();
            $table->date('fecha_nacimiento')->nullable();
            $table->integer('ci')->nullable();
            $table->string('nit', 30)->nullable();
            $table->integer('celular')->nullable();
            $table->string('estado_civil', 30)->nullable();
            $table->string('sexo', 30)->nullable();
            $table->string('direccion', 100)->nullable();
            $table->string('estado', 25)->default('ACTIVO');
            $table->date('fecha_reg')->nullable();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('estado');
            $table->index('razon_social');
            $table->index('user_id');
        });

        Schema::create('personas_tipo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('persona_id')
                ->constrained('personas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->unsignedBigInteger('rol_id');
            $table->foreign('rol_id')
                ->references('id')
                ->on('tipo')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->unique(['persona_id', 'rol_id'], 'uq_persona_tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personas_tipo');
        Schema::dropIfExists('personas');
        Schema::dropIfExists('tipo');
    }
};
