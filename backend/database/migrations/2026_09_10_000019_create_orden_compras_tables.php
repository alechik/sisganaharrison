<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orden_compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')
                ->constrained('personas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('cod_compra', 20)->unique();
            $table->date('fecha');
            $table->string('estado', 50);
            $table->decimal('descuento', 8, 2)->default(0);
            $table->decimal('total_peso', 8, 2)->nullable();
            $table->decimal('monto_total', 8, 2)->nullable();
            $table->foreignId('autorizado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('fecha_decision')->nullable();
            $table->string('observacion_estado', 255)->nullable();
            $table->timestamps();

            $table->index('proveedor_id');
            $table->index('user_id');
            $table->index('estado');
            $table->index('fecha');
        });

        Schema::create('detalle_orden_compra', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_compra_id')
                ->constrained('orden_compras')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('animal_id')
                ->nullable()
                ->constrained('animales')
                ->nullOnDelete();
            $table->foreignId('categoria_animal_id')
                ->constrained('categorias_animales')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->integer('cantidad');
            $table->decimal('precio', 8, 2);
            $table->decimal('descuento', 8, 2)->default(0);
            $table->decimal('subtotal', 8, 2);
            $table->timestamps();

            $table->index('orden_compra_id');
            $table->index('categoria_animal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_orden_compra');
        Schema::dropIfExists('orden_compras');
    }
};
