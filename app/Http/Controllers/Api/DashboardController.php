<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meal;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $totalMeals = Meal::count();
        $todayUploads = Meal::whereDate('created_at', Carbon::today())->count();
        $thisWeekUploads = Meal::whereBetween('created_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek(),
        ])->count();

        $breakdown = [
            'breakfast' => Meal::where('meal_type', 1)->count(),
            'lunch' => Meal::where('meal_type', 2)->count(),
            'dinner' => Meal::where('meal_type', 3)->count(),
            'snack' => Meal::where('meal_type', 4)->count(),
        ];

        return response()->json([
            'total_meals' => $totalMeals,
            'today_uploads' => $todayUploads,
            'this_week_uploads' => $thisWeekUploads,
            'breakdown' => $breakdown,
        ]);
    }
}
