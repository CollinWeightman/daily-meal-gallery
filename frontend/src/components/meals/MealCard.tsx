import { useState } from 'react';
import type { Meal } from '@/types/meal';
import { Utensils } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  onClick: (meal: Meal) => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className="group relative aspect-square overflow-hidden rounded-md cursor-pointer bg-[var(--bg-secondary)]"
            onClick={() => onClick(meal)}
        >
        {imgError ? (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <Utensils size={28} />
            </div>
        ) : (
            <img
                src={meal.thumbnail_url}
                alt={meal.meal_type_label}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-white/10 transition-colors duration-200" />
        </div>
    );
}