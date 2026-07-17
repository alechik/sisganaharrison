<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gestacion_id')
                ->constrained('gestaciones')
                ->restrictOnDelete();
            $table->date('fecha_parto');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index('gestacion_id');
            $table->index('fecha_parto');
            $table->unique('gestacion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partos');
    }
};
