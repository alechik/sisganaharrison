<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuarentenas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')
                ->constrained('personas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('orden_compra_id')
                ->nullable()
                ->unique()
                ->constrained('orden_compras')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('cod_compra', 20);
            $table->string('origen', 30);
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->string('estado', 50);
            $table->decimal('descuento', 8, 2)->default(0);
            $table->decimal('total_peso', 8, 2)->nullable();
            $table->decimal('monto_total', 8, 2)->nullable();
            $table->timestamps();

            $table->index('proveedor_id');
            $table->index('user_id');
            $table->index('cod_compra');
            $table->index('origen');
            $table->index('estado');
            $table->index('fecha_inicio');
        });

        Schema::create('cuarentena_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cuarentena_id')
                ->constrained('cuarentenas')
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
            $table->decimal('peso', 8, 2);
            $table->decimal('precio', 8, 2);
            $table->decimal('descuento', 8, 2)->default(0);
            $table->string('estado', 50);
            $table->decimal('subtotal', 8, 2);
            $table->timestamps();

            $table->index('cuarentena_id');
            $table->index('categoria_animal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuarentena_detalle');
        Schema::dropIfExists('cuarentenas');
    }
};
