<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animal_eventos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')
                ->constrained('animales')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->string('tipo', 50);
            $table->date('fecha');
            $table->text('descripcion')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('animal_id');
            $table->index('tipo');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animal_eventos');
    }
};
