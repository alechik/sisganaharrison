<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animales', function (Blueprint $table) {
            $table->dropForeign(['raza_id']);
            $table->dropForeign(['estado_productivo_id']);
            $table->dropForeign(['lote_id']);
        });

        Schema::table('animales', function (Blueprint $table) {
            $table->date('fecha_nacimiento')->nullable()->change();
            $table->unsignedBigInteger('raza_id')->nullable()->change();
            $table->unsignedBigInteger('estado_productivo_id')->nullable()->change();
            $table->unsignedBigInteger('lote_id')->nullable()->change();
        });

        Schema::table('animales', function (Blueprint $table) {
            $table->foreign('raza_id')->references('id')->on('razas')->restrictOnDelete();
            $table->foreign('estado_productivo_id')->references('id')->on('estados_productivos')->restrictOnDelete();
            $table->foreign('lote_id')->references('id')->on('lotes')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('animales', function (Blueprint $table) {
            $table->dropForeign(['raza_id']);
            $table->dropForeign(['estado_productivo_id']);
            $table->dropForeign(['lote_id']);
        });

        Schema::table('animales', function (Blueprint $table) {
            $table->date('fecha_nacimiento')->nullable(false)->change();
            $table->unsignedBigInteger('raza_id')->nullable(false)->change();
            $table->unsignedBigInteger('estado_productivo_id')->nullable(false)->change();
            $table->unsignedBigInteger('lote_id')->nullable(false)->change();
        });

        Schema::table('animales', function (Blueprint $table) {
            $table->foreign('raza_id')->references('id')->on('razas')->restrictOnDelete();
            $table->foreign('estado_productivo_id')->references('id')->on('estados_productivos')->restrictOnDelete();
            $table->foreign('lote_id')->references('id')->on('lotes')->restrictOnDelete();
        });
    }
};
