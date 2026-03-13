<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MealController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CloudinaryUsageController;
use Illuminate\Support\Facades\Route;

// 認證
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// 公開路由
Route::get('/meals', [MealController::class, 'index']);
Route::get('/meals/available-filters', [MealController::class, 'availableFilters']);
Route::get('/meals/{meal}', [MealController::class, 'show']);

// 需認證的路由
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/meals', [MealController::class, 'store']);
    Route::patch('/meals/{meal}', [MealController::class, 'update']);
    Route::delete('/meals/{meal}', [MealController::class, 'destroy']);
    Route::get('/admin/dashboard', [DashboardController::class, 'index']);
    Route::get('/admin/cloudinary-usage', [CloudinaryUsageController::class, 'index']);
});