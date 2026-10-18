<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->string('codigo_evento_sanitario', 20)->nullable();
        });

        DB::table('eventos_sanitarios')->orderBy('id')->each(function ($row) {
            DB::table('eventos_sanitarios')
                ->where('id', $row->id)
                ->update(['codigo_evento_sanitario' => 'EVS-'.str_pad((string) $row->id, 6, '0', STR_PAD_LEFT)]);
        });

        DB::statement("UPDATE eventos_sanitarios SET codigo_evento_sanitario = 'EVS-000000' WHERE codigo_evento_sanitario IS NULL");

        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->unique('codigo_evento_sanitario');
        });

        Schema::table('detalle_eventos_sanitarios', function (Blueprint $table) {
            $table->dropUnique(['evento_sanitario_id', 'animal_id']);
            $table->foreignId('almacen_id')
                ->nullable()
                ->constrained('almacenes')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->decimal('cantidad', 12, 2)->default(1);
            $table->index('almacen_id');
        });

        Schema::table('servicios_reproductivos', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->string('codigo_servicio', 20)->nullable();
            $table->decimal('total', 12, 2)->default(0);
            $table->timestamp('inventario_aplicado_at')->nullable();
            $table->index('user_id');
        });

        DB::table('servicios_reproductivos')->orderBy('id')->each(function ($row) {
            DB::table('servicios_reproductivos')
                ->where('id', $row->id)
                ->update(['codigo_servicio' => 'SRV-'.str_pad((string) $row->id, 6, '0', STR_PAD_LEFT)]);
        });

        $defaultUserId = DB::table('users')->orderBy('id')->value('id');
        if ($defaultUserId) {
            DB::table('servicios_reproductivos')->whereNull('user_id')->update(['user_id' => $defaultUserId]);
        }

        Schema::table('servicios_reproductivos', function (Blueprint $table) {
            $table->unique('codigo_servicio');
        });

        Schema::create('producto_servicio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')
                ->constrained('servicios_reproductivos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('medicamento_id')
                ->constrained('medicamentos')
                ->restrictOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('almacen_id')
                ->nullable()
                ->constrained('almacenes')
                ->restrictOnUpdate()
                ->nullOnDelete();
            $table->decimal('precio', 12, 2);
            $table->integer('cantidad');
            $table->timestamps();

            $table->index('servicio_id');
            $table->index('medicamento_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_servicio');

        Schema::table('servicios_reproductivos', function (Blueprint $table) {
            $table->dropUnique(['codigo_servicio']);
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['codigo_servicio', 'total', 'inventario_aplicado_at']);
        });

        Schema::table('detalle_eventos_sanitarios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('almacen_id');
            $table->dropColumn('cantidad');
            $table->unique(['evento_sanitario_id', 'animal_id']);
        });

        Schema::table('eventos_sanitarios', function (Blueprint $table) {
            $table->dropUnique(['codigo_evento_sanitario']);
            $table->dropColumn('codigo_evento_sanitario');
        });
    }
};
