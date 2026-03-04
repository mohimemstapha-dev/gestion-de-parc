<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
// database/migrations/xxxx_create_attraction_billet_table.php
public function up()
{
    Schema::create('attraction_billet', function (Blueprint $table) {
        $table->id();
        $table->foreignId('id_billet')->constrained('billets')->onDelete('cascade');
        $table->foreignId('id_attraction')->constrained('attractions')->onDelete('cascade');
        $table->timestamps();
        $table->unique(['id_billet', 'id_attraction']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attraction_billet');
    }
};
