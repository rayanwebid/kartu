<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'approval_status')) {
                $table->string('approval_status')->default('approved')->after('role');
            }
            if (!Schema::hasColumn('users', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approval_status');
            }
        });
        // backfill existing approved
        \DB::table('users')->whereNull('approved_at')->where('role', 'admin')->update(['approval_status' => 'approved', 'approved_at' => now()]);
        \DB::table('users')->whereNull('approved_at')->where('role', 'siswa')->update(['approval_status' => 'approved', 'approved_at' => now()]);
    }
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'approved_at')) $table->dropColumn('approved_at');
            if (Schema::hasColumn('users', 'approval_status')) $table->dropColumn('approval_status');
        });
    }
};
