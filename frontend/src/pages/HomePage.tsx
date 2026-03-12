// frontend/src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import client from '../api/client';
import type { Meal, MealListResponse } from '../types/meal';

interface Filters {
    meal_type: string;
    year: string;
    month: string;
}

export default function HomePage() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        meal_type: '',
        year: '',
        month: '',
    });

    useEffect(() => {
        const fetchMeals = async () => {
            setLoading(true);
            setError(false);
            try {
                const params: Record<string, string> = {};
                if (filters.meal_type) params.meal_type = filters.meal_type;
                if (filters.year)      params.year      = filters.year;
                if (filters.month)     params.month     = filters.month;

                const res = await client.get<MealListResponse>('/meals', { params });
                setMeals(res.data.data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMeals();
    }, [filters]);

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            ...(key === 'year' && !value ? { month: '' } : {}),
        }));
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Daily Meal Gallery</h1>

        {/* 過濾器 */}
        <div className="flex gap-4 mb-8">
            <select
                value={filters.meal_type}
                onChange={e => handleFilterChange('meal_type', e.target.value)}
                className="border rounded px-3 py-2"
            >
            <option value="">All Types</option>
            <option value="1">Breakfast</option>
            <option value="2">Lunch</option>
            <option value="3">Dinner</option>
            <option value="4">Snack</option>
            </select>

            <select
                value={filters.year}
                onChange={e => handleFilterChange('year', e.target.value)}
                className="border rounded px-3 py-2"
            >
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            </select>

            <select
                value={filters.month}
                onChange={e => handleFilterChange('month', e.target.value)}
                disabled={!filters.year}
                className="border rounded px-3 py-2 disabled:opacity-50"
            >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={String(m)}>
                        {new Date(2000, m - 1).toLocaleString('en', { month: 'long' })}
                    </option>
                ))}
            </select>
        </div>


        {/* 內容區 */}
        {loading && (
            <div className="text-center py-16 text-gray-500">Loading...</div>
        )}

        {!loading && error && (
            <div className="text-center py-16 text-red-500">Failed to load</div>
        )}

        {!loading && !error && meals.length === 0 && (
            <div className="text-center py-16 text-gray-500">No meals found</div>
        )}

        {!loading && !error && meals.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {meals.map(meal => (
                <div key={meal.id} className="rounded overflow-hidden shadow">
                <img
                    src={meal.thumbnail_url}
                    alt={meal.meal_type_label}
                    className="w-full aspect-square object-cover"
                />
                <div className="p-2">
                    <p className="text-sm font-medium capitalize">{meal.meal_type_label}</p>
                    {meal.remark && (
                    <p className="text-xs text-gray-500 truncate">{meal.remark}</p>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}