<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('animales', 'precio_kilo')) {
            return;
        }

        Schema::table('animales', function (Blueprint $table) {
            $table->decimal('precio_kilo', 12, 2)->nullable()->after('edad_actual');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('animales', 'precio_kilo')) {
            return;
        }

        Schema::table('animales', function (Blueprint $table) {
            $table->dropColumn('precio_kilo');
        });
    }
};
