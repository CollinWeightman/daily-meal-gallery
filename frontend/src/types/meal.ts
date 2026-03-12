export interface Meal {
    id: number;
    meal_type: number;
    meal_type_label: string;
    remark: string | null;
    taken_at: string | null;
    cloudinary_url: string;
    thumbnail_url: string;
    created_at: string;
    updated_at: string;
}
  
export interface MealListResponse {
    data: Meal[];
    meta: {
        current_page: number;
        total: number;
        per_page: number;
        last_page: number;
    };
}