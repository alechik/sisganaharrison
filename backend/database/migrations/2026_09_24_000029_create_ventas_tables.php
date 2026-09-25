<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')
                ->constrained('personas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('cod_venta', 20)->unique();
            $table->date('fecha_venta');
            $table->string('estado', 50);
            $table->decimal('descuento', 8, 2)->default(0);
            $table->decimal('total_peso', 8, 2)->nullable();
            $table->decimal('monto_total', 8, 2)->nullable();
            $table->foreignId('autorizado_por')
                ->nullable()
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->timestamp('fecha_decision')->nullable();
            $table->string('observacion_estado', 255)->nullable();
            $table->timestamps();

            $table->index('cliente_id');
            $table->index('user_id');
            $table->index('estado');
            $table->index('fecha_venta');
        });

        Schema::create('detalle_ventas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')
                ->constrained('ventas')
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

            $table->index('venta_id');
            $table->index('animal_id');
            $table->index('lote_id');
            $table->unique(['venta_id', 'animal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ventas');
        Schema::dropIfExists('ventas');
    }
};
