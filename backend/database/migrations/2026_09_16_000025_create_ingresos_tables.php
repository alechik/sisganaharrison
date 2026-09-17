<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingresos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->foreignId('proveedor_id')
                ->constrained('personas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('cuarentena_id')
                ->constrained('cuarentenas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('lote_id')
                ->constrained('lotes')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->date('fecha_ingreso');
            $table->string('estado', 50);
            $table->text('observaciones')->nullable();
            $table->decimal('descuento', 8, 2)->default(0);
            $table->decimal('total_peso', 8, 2)->nullable();
            $table->decimal('monto_total', 8, 2)->nullable();
            $table->timestamps();

            $table->index('proveedor_id');
            $table->index('user_id');
            $table->index('cuarentena_id');
            $table->index('lote_id');
            $table->index('fecha_ingreso');
            $table->index('estado');
        });

        Schema::create('detalle_ingresos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingreso_id')
                ->constrained('ingresos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('animal_id')
                ->constrained('animales')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->text('observaciones')->nullable();
            $table->decimal('peso_oc', 8, 2);
            $table->decimal('peso_ingreso', 8, 2);
            $table->decimal('precio_compra', 8, 2);
            $table->unsignedInteger('edad')->nullable();
            $table->timestamps();

            $table->index('ingreso_id');
            $table->index('animal_id');
            $table->unique(['ingreso_id', 'animal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ingresos');
        Schema::dropIfExists('ingresos');
    }
};
