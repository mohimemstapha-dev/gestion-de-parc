<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $col) {
            $col->id();
            $col->decimal('amount', 10, 2)->default(0);
            $col->integer('visitor_count')->default(1);
            $col->string('type'); // 'ticket', 'restaurant', 'membership', etc.
            $col->string('description')->nullable();
            $col->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
