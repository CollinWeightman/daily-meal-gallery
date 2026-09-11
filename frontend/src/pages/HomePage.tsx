import { useState, useCallback, useEffect, useRef } from 'react';
import type { Meal } from '@/types/meal';
import { useMeals } from '@/hooks/useMeals';
import { useAvailableFilters } from '@/hooks/useAvailableFilters';
import { MealGrid } from '@/components/meals/MealGrid';
import { MealLightbox } from '@/components/meals/MealLightbox';
import ColdStartNotice from '@/components/ui/ColdStartNotice';

const MEAL_TYPES = [
    { value: 0, label: 'All' },
    { value: 1, label: 'Breakfast' },
    { value: 2, label: 'Lunch' },
    { value: 3, label: 'Dinner' },
    { value: 4, label: 'Snack' },
];

interface HomePageProps {
    uploadOpen: boolean;
    setUploadOpen: (open: boolean) => void;
    refreshKey: number;
}

export default function HomePage({ setUploadOpen: _setUploadOpen, refreshKey }: HomePageProps) {
    const [mealType, setMealType] = useState(0);
    const [year, setYear] = useState<number | undefined>();
    const [month, setMonth] = useState<number | undefined>();
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

    const filters = {
        meal_type: mealType || undefined,
        year,
        month,
    };

    const { meals, loading, initialLoading, hasMore, loadMore, refresh, errorType } = useMeals(filters);

    useEffect(() => {
        if (refreshKey > 0) refresh();
    }, [refreshKey]);

    const { filters: availableFilters } = useAvailableFilters();

    const hasFilters = !!(mealType || year || month);

    const selectedYear = availableFilters.years.find(y => y.year === year);
    const availableMonths = selectedYear?.months ?? [];

    const handleYearChange = (val: string) => {
        const y = val === '' ? undefined : Number(val);
        setYear(y);
        setMonth(undefined);
    };

    const handleMonthChange = (val: string) => {
        setMonth(val === '' ? undefined : Number(val));
    };

    const handleMealClick = useCallback((meal: Meal) => {
        setSelectedMeal(meal);
    }, []);

    const [showColdStart, setShowColdStart] = useState(false);
    const coldStartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (initialLoading && errorType === 'none') {
            coldStartTimer.current = setTimeout(() => setShowColdStart(true), 12000);
        } else {
            if (coldStartTimer.current) clearTimeout(coldStartTimer.current);
            setShowColdStart(false);
        }
        return () => {
            if (coldStartTimer.current) clearTimeout(coldStartTimer.current);
        };
    }, [initialLoading, errorType]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Filter 區塊 */}
            <div className="flex flex-wrap items-center gap-3 mb-6">

                {/* 餐別 Chips */}
                <div className="flex flex-wrap gap-1.5">
                    {MEAL_TYPES.map(t => (
                        <button
                            key={t.value}
                            onClick={() => setMealType(t.value)}
                            className={[
                                'px-3 py-1 text-sm rounded-full border transition-colors',
                                mealType === t.value
                                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                    : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
                            ].join(' ')}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* 年份下拉 — 多於一個年份才顯示 */}
                {availableFilters.years.length > 1 && (
                    <select
                        value={year ?? ''}
                        onChange={e => handleYearChange(e.target.value)}
                        className="text-sm px-3 py-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                        <option value="">All Years</option>
                        {availableFilters.years.map(y => (
                            <option key={y.year} value={y.year}>{y.year}</option>
                        ))}
                    </select>
                )}

                {/* 月份下拉 — 選了年份且多於一個月份才顯示 */}
                {year && availableMonths.length > 1 && (
                    <select
                        value={month ?? ''}
                        onChange={e => handleMonthChange(e.target.value)}
                        className="text-sm px-3 py-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                        <option value="">All Months</option>
                        {availableMonths.map(m => (
                            <option key={m} value={m}>
                                {new Date(2000, m - 1).toLocaleString('en', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* 照片網格 */}
            {errorType !== 'none' ? (
                <ColdStartNotice
                    variant={errorType === 'database_unavailable' ? 'unavailable' : 'waking'}
                    onRetry={refresh}
                />
            ) : showColdStart ? (
                <ColdStartNotice />
            ) : (
                <MealGrid
                    meals={meals}
                    loading={loading}
                    initialLoading={initialLoading}
                    hasMore={hasMore}
                    hasFilters={hasFilters}
                    onLoadMore={loadMore}
                    onMealClick={handleMealClick}
                />
            )}
            <MealLightbox
                meal={selectedMeal}
                onClose={() => setSelectedMeal(null)}
                onDeleted={refresh}
                onUpdated={refresh}
            />
        </div>
    );
}