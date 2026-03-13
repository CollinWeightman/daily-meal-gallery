import { useEffect, useRef } from 'react';
import type { Meal } from '@/types/meal';
import { MealCard } from './MealCard';
import { Utensils } from 'lucide-react';

interface MealGridProps {
    meals: Meal[];
    loading: boolean;
    initialLoading: boolean;
    hasMore: boolean;
    hasFilters: boolean;
    onLoadMore: () => void;
    onMealClick: (meal: Meal) => void;
}

function SkeletonCard() {
    return (
        <div className="aspect-square rounded-md bg-[var(--bg-secondary)] animate-pulse" />
    );
}

export function MealGrid({
    meals,
    loading,
    initialLoading,
    hasMore,
    hasFilters,
    onLoadMore,
    onMealClick,
}: MealGridProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting) onLoadMore(); },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [onLoadMore]);

    // 初始載入 skeleton
    if (initialLoading) {
        return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        );
    }

    // 空狀態
    if (!loading && meals.length === 0) {
        return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--text-muted)]">
            <Utensils size={40} strokeWidth={1.5} />
            <p className="text-sm">
            {hasFilters ? 'No results for this filter' : 'No meals yet'}
            </p>
        </div>
        );
    }

    return (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {meals.map(meal => (
                <MealCard key={meal.id} meal={meal} onClick={onMealClick} />
            ))}
            {/* 載入中補 skeleton */}
            {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
        </div>

        {/* Infinite scroll sentinel */}
        {hasMore && <div ref={sentinelRef} className="h-8" />}
        </>
    );
}