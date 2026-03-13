<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\MealResource;
use App\Models\Meal;
use App\Http\Requests\StoreMealRequest;
use App\Services\CloudinaryService;
use App\Http\Requests\UpdateMealRequest;
use Illuminate\Http\JsonResponse;

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
    public function store(StoreMealRequest $request, CloudinaryService $cloudinary)
    {
        $publicId = $cloudinary->upload($request->file('photo'));
    
        $meal = Meal::create([
            'cloudinary_public_id' => $publicId,
            'meal_type' => $request->meal_type,
            'remark' => $request->remark,
            'taken_at' => $request->taken_at ?? now(),
        ]);
    
        return (new MealResource($meal))->response()->setStatusCode(201);
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
    public function update(UpdateMealRequest $request, Meal $meal): MealResource
    {
        $meal->update($request->validated());
    
        return new MealResource($meal->fresh());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Meal $meal, CloudinaryService $cloudinary)
    {
        $cloudinary->delete($meal->cloudinary_public_id);
        $meal->delete();
        return response()->noContent();
    }

    public function availableFilters(): JsonResponse
    {
        $rows = Meal::query()
            ->selectRaw('EXTRACT(YEAR FROM COALESCE(taken_at, created_at))::int AS year')
            ->selectRaw('EXTRACT(MONTH FROM COALESCE(taken_at, created_at))::int AS month')
            ->groupByRaw('1, 2')
            ->orderByRaw('1 DESC, 2 ASC')
            ->get();

        $years = $rows
            ->groupBy('year')
            ->map(fn($months, $year) => [
                'year'   => $year,
                'months' => $months->pluck('month')->map(fn($m) => (int) $m)->values(),
            ])
            ->values();

        return response()->json(['years' => $years]);
    }
}
