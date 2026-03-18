interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  trendLabel: string;
  icon: string;
  iconColor: string;
}

export default function StatsCard({
  title,
  value,
  trend,
  trendDirection,
  trendLabel,
  icon,
  iconColor,
}: StatsCardProps) {
  const trendColor = trendDirection === 'up' ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trendDirection === 'up' ? 'trending_up' : 'trending_down';

  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-background-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-text-secondary dark:text-text-secondary/80 text-sm font-medium">{title}</p>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <p className="text-text-dark dark:text-text-light tracking-tight text-3xl font-bold">{value}</p>
      <p className={`${trendColor} text-sm font-semibold flex items-center gap-1`}>
        <span className="material-symbols-outlined text-sm">{TrendIcon}</span> {trend}{' '}
        <span className="text-text-secondary font-normal">{trendLabel}</span>
      </p>
    </div>
  );
}
