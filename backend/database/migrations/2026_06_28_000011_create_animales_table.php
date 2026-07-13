<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animales', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique();
            $table->string('arete', 30)->nullable()->unique();
            $table->string('nombre', 100)->nullable();
            // $table->char('sexo', 1);
            $table->enum('sexo', ['M', 'H']);
            $table->date('fecha_nacimiento');
            $table->foreignId('raza_id')
                ->constrained('razas')
                ->restrictOnDelete();
            $table->foreignId('categoria_id')
                ->constrained('categorias_animales')
                ->restrictOnDelete();
            $table->foreignId('estado_productivo_id')
                ->constrained('estados_productivos')
                ->restrictOnDelete();
            $table->foreignId('lote_id')
                ->constrained('lotes')
                ->restrictOnDelete();
            $table->foreignId('madre_id')
                ->nullable()
                ->constrained('animales')
                ->nullOnDelete();
            $table->foreignId('padre_id')
                ->nullable()
                ->constrained('animales')
                ->nullOnDelete();
            $table->string('color', 60)->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('raza_id');
            $table->index('categoria_id');
            $table->index('estado_productivo_id');
            $table->index('lote_id');
            $table->index('activo');
            $table->index('nombre');

            // $table->check('sexo IN (\'M\', \'H\')');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animales');
    }
};
