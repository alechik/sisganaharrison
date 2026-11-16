<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE ingreso_productos ALTER COLUMN orden_compra_id DROP NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE ingreso_productos ALTER COLUMN orden_compra_id SET NOT NULL');
    }
};
