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
        Schema::table('card_templates', function (Blueprint $table) {
            $table->string('foundation_name')->nullable();
            $table->string('school_name')->nullable();
            $table->string('accreditation')->nullable();
            $table->string('school_address')->nullable();
            $table->string('sign_place_date')->nullable();
            $table->string('principal_name')->nullable();
            $table->string('principal_nip')->nullable();
            $table->string('logo_image_path')->nullable();
            $table->string('signature_image_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('card_templates', function (Blueprint $table) {
            $table->dropColumn([
                'foundation_name', 'school_name', 'accreditation', 'school_address',
                'sign_place_date', 'principal_name', 'principal_nip',
                'logo_image_path', 'signature_image_path'
            ]);
        });
    }
};
