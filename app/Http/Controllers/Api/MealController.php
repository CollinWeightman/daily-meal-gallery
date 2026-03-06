<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\MealResource;
use App\Models\Meal;

class MealController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Meal::query();

        if ($request->has('meal_type')) {
            $query->where('meal_type', $request->meal_type);
        }

        if ($request->has('year')) {
            $query->whereYear('taken_at', $request->year);
        }

        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('taken_at', $request->month);
        }

        $query->orderBy('taken_at', 'desc')
              ->orderBy('created_at', 'desc');

        $meals = $query->paginate($request->per_page ?? 20);

        return MealResource::collection($meals);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Meal $meal)
    {
        return new MealResource($meal);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Meal $meal)
    {
        //
    }
}
