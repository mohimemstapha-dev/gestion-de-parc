<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
// database/migrations/xxxx_create_billets_table.php
public function up()
{
    Schema::create('billets', function (Blueprint $table) {
        $table->id();
        $table->string('numero_billet');
        $table->foreignId('id_visiteur')->constrained('visiteurs');
        $table->foreignId('id_ticket')->constrained('tickets');
        $table->foreignId('created_by')->nullable()->constrained('users');
        $table->foreignId('updated_by')->nullable()->constrained('users');
        $table->foreignId('deleted_by')->nullable()->constrained('users');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billets');
    }
};
