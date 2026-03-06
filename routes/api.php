<?php

use App\Http\Controllers\Api\MealController;
use Illuminate\Support\Facades\Route;

Route::get('/meals', [MealController::class, 'index']);
Route::get('/meals/{meal}', [MealController::class, 'show']);
Route::post('/meals', [MealController::class, 'store']);
Route::patch('/meals/{meal}', [MealController::class, 'update']);
Route::delete('/meals/{meal}', [MealController::class, 'destroy']);
