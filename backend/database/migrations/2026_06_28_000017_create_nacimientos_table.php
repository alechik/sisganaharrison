<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nacimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parto_id')
                ->constrained('partos')
                ->restrictOnDelete();
            $table->foreignId('animal_id')
                ->nullable()
                ->constrained('animales')
                ->restrictOnDelete();
            $table->string('arete', 30)->nullable();
            $table->char('sexo', 1);
            $table->decimal('peso_nacimiento', 8, 2)->nullable();
            $table->string('estado_nacimiento', 10);
            $table->string('causa_muerte', 150)->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('registrado_por')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();
            $table->timestamps();

            $table->index('parto_id');
            $table->index('animal_id');
            $table->index('arete');
            $table->index('estado_nacimiento');
            $table->index('sexo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nacimientos');
    }
};
