<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meals', function (Blueprint $table) {
            $table->index('meal_type', 'meals_meal_type_index');
            $table->index('taken_at', 'meals_taken_at_index');
            $table->index('created_at', 'meals_created_at_index');
            $table->index(['meal_type', 'taken_at'], 'meals_meal_type_taken_at_index');
        });
    
        Schema::table('meal_photos', function (Blueprint $table) {
            $table->index('meal_id', 'meal_photos_meal_id_index');
        });
    }
    
    public function down(): void
    {
        Schema::table('meals', function (Blueprint $table) {
            $table->dropIndex('meals_meal_type_index');
            $table->dropIndex('meals_taken_at_index');
            $table->dropIndex('meals_created_at_index');
            $table->dropIndex('meals_meal_type_taken_at_index');
        });
    
        Schema::table('meal_photos', function (Blueprint $table) {
            $table->dropIndex('meal_photos_meal_id_index');
        });
    }
};