import { useEffect, useState } from 'react';
import type { DashboardStats, CloudinaryUsage } from '@/types/meal';
import client from '@/api/client';

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
      <div
        className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatCard({ label, value, max, unit }: { label: string; value: number; max?: number; unit?: string }) {
  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col gap-2">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-display text-[var(--text-primary)]">
        {value.toLocaleString()}
        {unit && <span className="text-sm font-body text-[var(--text-muted)] ml-1">{unit}</span>}
        {max !== undefined && (
          <span className="text-sm font-body text-[var(--text-muted)]"> / {max}</span>
        )}
      </p>
      {max !== undefined && <ProgressBar value={value} max={max} />}
    </div>
  );
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usage, setUsage] = useState<CloudinaryUsage | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    client.get<DashboardStats>('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));

    client.get<CloudinaryUsage>('/admin/cloudinary-usage')
      .then(res => setUsage(res.data))
      .catch(() => setUsage(null))
      .finally(() => setLoadingUsage(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">

      <h1 className="text-2xl font-display text-[var(--text-primary)]">Dashboard</h1>

      {/* Cloudinary 配額 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Cloudinary Usage
        </h2>

        {loadingUsage ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
            ))}
          </div>
        ) : usage?.error ? (
          <p className="text-sm text-[var(--text-muted)]">Unable to load Cloudinary usage.</p>
        ) : usage ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Credits" value={usage.credits_used} max={usage.credits_limit} />
            <StatCard label="Storage" value={Number(usage.storage_used_gb.toFixed(2))} unit="GB" />
            <StatCard label="Bandwidth" value={Number(usage.bandwidth_used_gb.toFixed(2))} unit="GB" />
            <StatCard label="Transformations" value={usage.transformations_used} />
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No data available.</p>
        )}
      </section>

      {/* 餐點統計 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Meal Stats — This Month
        </h2>

        {loadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Total Meals" value={stats.total_meals} />
          <StatCard label="Today" value={stats.today_uploads} />
          <StatCard label="This Week" value={stats.this_week_uploads} />
          {Object.entries(stats.breakdown ?? {}).map(([key, val]) => (
            <StatCard key={key} label={MEAL_TYPE_LABELS[key] ?? key} value={val as number} />
          ))}
        </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No data available.</p>
        )}
      </section>

    </div>
  );
}