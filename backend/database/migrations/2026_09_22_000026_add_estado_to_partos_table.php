<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('partos', 'estado')) {
            return;
        }

        Schema::table('partos', function (Blueprint $table) {
            $table->string('estado', 30)->default('PENDIENTE')->after('fecha_parto');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('partos', 'estado')) {
            return;
        }

        Schema::table('partos', function (Blueprint $table) {
            $table->dropIndex(['estado']);
            $table->dropColumn('estado');
        });
    }
};
