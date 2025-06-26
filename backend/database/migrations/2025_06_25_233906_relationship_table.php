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
        Schema::create('relationships', function (Blueprint $table) {
            $table->id();
            $table->string('source_table_id');
            $table->string('target_table_id');
            $table->string('relationship_type')->default('1:N'); // 1:N, N:1, M:N
            $table->json('edge_data')->nullable(); // Edge özellikleri
            $table->unsignedBigInteger('database_id');
            $table->foreign('database_id')->references('id')->on('databases')->onDelete('cascade');
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('relationships');
    }
};
