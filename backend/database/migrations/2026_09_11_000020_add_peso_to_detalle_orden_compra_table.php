<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detalle_orden_compra', function (Blueprint $table) {
            $table->decimal('peso', 8, 2)->default(0)->after('cantidad');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_orden_compra', function (Blueprint $table) {
            $table->dropColumn('peso');
        });
    }
};
