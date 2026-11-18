<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('potreros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcela_id')
                ->constrained('parcelas')
                ->restrictOnDelete();
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->integer('capacidad_animales')->default(0);
            $table->decimal('area_ha', 10, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('parcela_id');
            $table->index('activo');
            $table->index('nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('potreros');
    }
};
