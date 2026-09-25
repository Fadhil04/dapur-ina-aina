import { Card } from './index';

export function KpiCard({ label, value, icon: Icon, trend, iconColor = 'primary' }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{label}</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-display-lg text-headline-lg text-on-surface">{value}</span>
        </div>
        {trend && (
          <div className="mt-space-md">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-md text-label-md">
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-${iconColor}`}>
        {Icon && <Icon size={26} />}
      </div>
    </Card>
  );
}
