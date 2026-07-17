<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')
                ->constrained('animales')
                ->restrictOnDelete();
            $table->date('fecha');
            $table->decimal('peso', 8, 2);
            $table->text('observaciones')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('animal_id');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pesajes');
    }
};
