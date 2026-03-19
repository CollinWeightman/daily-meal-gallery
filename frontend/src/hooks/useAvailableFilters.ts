import { useState, useEffect } from 'react';
import client from '@/api/client';
import type { AvailableFilters } from '@/types/meal';

export function useAvailableFilters() {
    const [filters, setFilters] = useState<AvailableFilters>({ years: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get<AvailableFilters>('/meals/available-filters')
        .then(res => setFilters(res.data))
        .catch(() => setFilters({ years: [] }))
        .finally(() => setLoading(false));
    }, []);

    return { filters, loading };
}