<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. 移除 meals 表的 cloudinary_public_id 欄位
        Schema::table('meals', function (Blueprint $table) {
            $table->dropColumn('cloudinary_public_id');
        });

        // 2. 建立 meal_photos 表
        Schema::create('meal_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meal_id')
                  ->constrained('meals')
                  ->onDelete('cascade');
            $table->string('cloudinary_public_id')->unique();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_photos');

        Schema::table('meals', function (Blueprint $table) {
            $table->string('cloudinary_public_id')->nullable();
        });
    }
};