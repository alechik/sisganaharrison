<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('almacenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('establecimiento_id')
                ->constrained('establecimientos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('nombre', 100);
            $table->string('direccion', 150)->nullable();
            $table->text('observacion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique('establecimiento_id');
            $table->index('activo');
        });

        Schema::create('almacen_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('almacen_id')
                ->constrained('almacenes')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('medicamento_id')
                ->constrained('medicamentos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->decimal('stock', 12, 2)->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['almacen_id', 'medicamento_id']);
            $table->index('medicamento_id');
        });

        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('almacen_id')
                ->constrained('almacenes')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('medicamento_id')
                ->constrained('medicamentos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('tipo', 40);
            $table->decimal('cantidad', 12, 2);
            $table->decimal('precio_unitario', 12, 2)->default(0);
            $table->string('origen_type', 80);
            $table->unsignedBigInteger('origen_id');
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['almacen_id', 'medicamento_id']);
            $table->index(['origen_type', 'origen_id']);
            $table->index('tipo');
        });

        DB::statement(
            'CREATE UNIQUE INDEX movimientos_inventario_origen_unico ON movimientos_inventario (tipo, origen_type, origen_id, almacen_id, medicamento_id)'
        );

        Schema::create('orden_compras_productos', function (Blueprint $table) {
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
            $table->string('estado', 20);
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('monto_total', 12, 2)->default(0);
            $table->foreignId('autorizado_por')
                ->nullable()
                ->constrained('users')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->timestamp('fecha_decision')->nullable();
            $table->text('observacion_estado')->nullable();
            $table->timestamps();

            $table->index('proveedor_id');
            $table->index('user_id');
            $table->index('estado');
        });

        Schema::create('detalle_orden_compra_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_compra_id')
                ->constrained('orden_compras_productos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('medicamento_id')
                ->constrained('medicamentos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->integer('cantidad');
            $table->decimal('precio', 12, 2);
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();

            $table->index('orden_compra_id');
            $table->index('medicamento_id');
        });

        Schema::create('ingreso_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_compra_id')
                ->constrained('orden_compras_productos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('proveedor_id')
                ->constrained('personas')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('almacen_id')
                ->constrained('almacenes')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->string('cod_ingreso', 20)->unique();
            $table->date('fecha');
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('monto_total', 12, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index('orden_compra_id');
            $table->index('almacen_id');
        });

        Schema::create('detalle_ingreso_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingreso_producto_id')
                ->constrained('ingreso_productos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('medicamento_id')
                ->constrained('medicamentos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->integer('cantidad');
            $table->decimal('precio', 12, 2);
            $table->decimal('descuento', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();

            $table->index('ingreso_producto_id');
            $table->index('medicamento_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ingreso_productos');
        Schema::dropIfExists('ingreso_productos');
        Schema::dropIfExists('detalle_orden_compra_productos');
        Schema::dropIfExists('orden_compras_productos');
        Schema::dropIfExists('movimientos_inventario');
        Schema::dropIfExists('almacen_producto');
        Schema::dropIfExists('almacenes');
    }
};
