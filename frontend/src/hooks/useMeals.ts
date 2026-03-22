import { useState, useEffect, useCallback, useRef } from 'react';
import client from '@/api/client';
import type { Meal, MealListResponse, MealFilters } from '@/types/meal';

export function useMeals(filters: MealFilters) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const filtersRef = useRef(filters);

    useEffect(() => {
        filtersRef.current = filters;
        setMeals([]);
        setPage(1);
        setHasMore(true);
        setInitialLoading(true);
        setError(false);
    }, [filters.meal_type, filters.year, filters.month]);

    const fetchPage = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page: pageNum, per_page: 20 };
            const f = filtersRef.current;
            if (f.meal_type) params.meal_type = f.meal_type;
            if (f.year) params.year = f.year;
            if (f.month) params.month = f.month;

            const res = await client.get<MealListResponse>('/meals', { params });
            const { data, meta } = res.data;

            setMeals(prev => pageNum === 1 ? data : [...prev, ...data]);
            setHasMore(meta.current_page < meta.last_page);
        } catch {
            setHasMore(false);
            setError(true);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPage(page);
    }, [page, fetchPage, filters.meal_type, filters.year, filters.month, refreshKey]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) setPage(p => p + 1);
    }, [loading, hasMore]);

    const refresh = useCallback(() => {
        setMeals([]);
        setPage(1);
        setHasMore(true);
        setInitialLoading(true);
        setError(false);
        setRefreshKey(k => k + 1);
    }, []);

    return { meals, loading, initialLoading, hasMore, loadMore, refresh, error };
}