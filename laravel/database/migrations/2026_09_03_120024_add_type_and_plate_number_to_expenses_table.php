<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (!Schema::hasColumn('expenses', 'type')) {
                $table->string('type', 20)->default('out')->after('code');
            }
            if (!Schema::hasColumn('expenses', 'plate_number')) {
                $table->string('plate_number', 50)->nullable()->after('pic_name');
            }
        });

        // Make category flexible string so 'Deposit' and future custom categories work seamlessly
        try {
            DB::statement("ALTER TABLE `expenses` MODIFY COLUMN `category` VARCHAR(100) NOT NULL DEFAULT 'Lainnya'");
        } catch (\Throwable $e) {
            // ignore if already modified
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (Schema::hasColumn('expenses', 'type')) {
                $table->dropColumn('type');
            }
            if (Schema::hasColumn('expenses', 'plate_number')) {
                $table->dropColumn('plate_number');
            }
        });
    }
};
