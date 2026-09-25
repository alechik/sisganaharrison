<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_salidas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->timestamps();
            $table->softDeletes();

            $table->index('nombre');
            $table->unique('nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_salidas');
    }
};
