<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salidas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')
                ->nullable()
                ->constrained('personas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('venta_id')
                ->nullable()
                ->constrained('ventas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('tipo_salida_id')
                ->constrained('tipos_salidas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('codigo', 20)->unique();
            $table->date('fecha_salida');
            $table->string('estado', 50);
            $table->decimal('descuento', 8, 2)->default(0);
            $table->decimal('total_peso', 8, 2)->nullable();
            $table->decimal('monto_total', 8, 2)->nullable();
            $table->timestamps();

            $table->index('cliente_id');
            $table->index('user_id');
            $table->index('tipo_salida_id');
            $table->index('estado');
            $table->index('fecha_salida');
            $table->unique('venta_id');
        });

        Schema::create('detalle_salidas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salida_id')
                ->constrained('salidas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('animal_id')
                ->constrained('animales')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->integer('cantidad')->default(1);
            $table->decimal('peso', 8, 2);
            $table->foreignId('lote_id')
                ->nullable()
                ->constrained('lotes')
                ->nullOnDelete();
            $table->decimal('precio', 8, 2);
            $table->decimal('descuento', 8, 2)->default(0);
            $table->decimal('subtotal', 8, 2);
            $table->timestamps();

            $table->index('salida_id');
            $table->index('animal_id');
            $table->index('lote_id');
            $table->unique(['salida_id', 'animal_id']);
            $table->unique('animal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_salidas');
        Schema::dropIfExists('salidas');
    }
};
