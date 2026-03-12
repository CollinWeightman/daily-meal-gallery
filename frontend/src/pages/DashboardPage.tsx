import { useState, useEffect } from 'react';
import apiClient from '../api/client';

interface DashboardData {
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await apiClient.get('/admin/dashboard');
      setData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Total Meals</h3>
          <p className="text-4xl font-bold">{data.total_meals}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Today's Uploads</h3>
          <p className="text-4xl font-bold">{data.today_uploads}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">This Week</h3>
          <p className="text-4xl font-bold">{data.this_week_uploads}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Meal Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Breakfast</p>
            <p className="text-2xl font-bold">{data.breakdown.breakfast}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lunch</p>
            <p className="text-2xl font-bold">{data.breakdown.lunch}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dinner</p>
            <p className="text-2xl font-bold">{data.breakdown.dinner}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Snack</p>
            <p className="text-2xl font-bold">{data.breakdown.snack}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
