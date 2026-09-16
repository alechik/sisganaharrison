<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animales', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('observaciones')
                ->constrained('users')
                ->restrictOnDelete();
            $table->unsignedInteger('edad_inicial')->nullable()->after('user_id');
            $table->unsignedInteger('edad_actual')->nullable()->after('edad_inicial');
            $table->index('user_id');
        });

        $userId = User::query()->orderBy('id')->value('id');
        if ($userId) {
            DB::table('animales')->whereNull('user_id')->update(['user_id' => $userId]);
        }

        Schema::table('animales', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });

        Schema::table('detalle_orden_compra', function (Blueprint $table) {
            $table->unsignedInteger('edad')->nullable()->after('peso');
        });

        Schema::table('cuarentena_detalle', function (Blueprint $table) {
            $table->unsignedInteger('edad')->nullable()->after('peso');
        });
    }

    public function down(): void
    {
        Schema::table('detalle_orden_compra', function (Blueprint $table) {
            $table->dropColumn('edad');
        });

        Schema::table('cuarentena_detalle', function (Blueprint $table) {
            $table->dropColumn('edad');
        });

        Schema::table('animales', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'edad_inicial', 'edad_actual']);
        });
    }
};
