<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('animales', 'estado')) {
            Schema::table('animales', function (Blueprint $table) {
                $table->string('estado', 30)->default('ACTIVO')->after('precio_kilo');
            });
        }

        if (Schema::hasColumn('animales', 'activo')) {
            DB::table('animales')->where('activo', true)->update(['estado' => 'ACTIVO']);
            DB::table('animales')->where('activo', false)->update(['estado' => 'OTRO']);

            Schema::table('animales', function (Blueprint $table) {
                $table->dropIndex(['activo']);
                $table->dropColumn('activo');
            });
        }

        Schema::table('animales', function (Blueprint $table) {
            $table->index('estado');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('animales', 'activo')) {
            Schema::table('animales', function (Blueprint $table) {
                $table->boolean('activo')->default(true)->after('precio_kilo');
            });
        }

        if (Schema::hasColumn('animales', 'estado')) {
            DB::table('animales')->where('estado', 'ACTIVO')->update(['activo' => true]);
            DB::table('animales')->where('estado', '!=', 'ACTIVO')->update(['activo' => false]);

            Schema::table('animales', function (Blueprint $table) {
                $table->dropIndex(['estado']);
                $table->dropColumn('estado');
            });
        }

        Schema::table('animales', function (Blueprint $table) {
            $table->index('activo');
        });
    }
};
