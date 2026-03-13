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
  
  export interface AvailableFilters {
    years: {
      year: number;
      months: number[];
    }[];
  }
  
  export interface MealFilters {
    meal_type?: number;
    year?: number;
    month?: number;
    page?: number;
  }
  
  export interface DashboardStats {
    total_meals: number;
    today_uploads: number;
    this_week_uploads: number;
    breakdown: {
      breakfast: number;
      lunch: number;
      dinner: number;
      snack: number;
    };
  }
  
  export interface CloudinaryUsage {
    credits_used: number;
    credits_limit: number;
    storage_used_gb: number;
    bandwidth_used_gb: number;
    transformations_used: number;
    error?: string;
  }