<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('dusun')->nullable()->after('address');
            $table->string('rt')->nullable()->after('dusun');
            $table->string('rw')->nullable()->after('rt');
            $table->string('desa')->nullable()->after('rw');
            $table->string('kecamatan')->nullable()->after('desa');
            $table->string('kabupaten')->nullable()->after('kecamatan');
            $table->boolean('is_locked')->default(false)->after('kabupaten');
        });
        // legacy address tetap, tapi untuk data lama biarkan terisi; untuk baru akan diisi otomatis dari 6 kolom
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['dusun','rt','rw','desa','kecamatan','kabupaten','is_locked']);
        });
    }
};
