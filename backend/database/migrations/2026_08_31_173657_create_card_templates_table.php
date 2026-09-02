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
        Schema::create('card_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_name');
            $table->string('background_image_path');
            $table->enum('orientation', ['landscape', 'portrait'])->default('landscape');
            $table->float('width_mm')->default(85.60);
            $table->float('height_mm')->default(53.98);
            $table->json('layout_coordinates')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_templates');
    }
};
