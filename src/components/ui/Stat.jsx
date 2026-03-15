import { clsx } from 'clsx';
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineMinus } from 'react-icons/hi2';

const trendConfig = {
  up: { icon: HiOutlineArrowTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  down: { icon: HiOutlineArrowTrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
  neutral: { icon: HiOutlineMinus, color: 'text-slate-500', bg: 'bg-slate-50' },
};

export default function Stat({ label, value, change, trend = 'neutral', icon: Icon, prefix, suffix }) {
  const trendInfo = trendConfig[trend] || trendConfig.neutral;
  const TrendIcon = trendInfo.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
              trendInfo.bg,
              trendInfo.color
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-slate-400">vs mois precedent</span>
        </div>
      )}
    </div>
  );
}
