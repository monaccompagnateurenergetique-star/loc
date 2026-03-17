import { clsx } from 'clsx';
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineMinus } from 'react-icons/hi2';

const trendConfig = {
  up: { icon: HiOutlineArrowTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  down: { icon: HiOutlineArrowTrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
  neutral: { icon: HiOutlineMinus, color: 'text-slate-500', bg: 'bg-slate-50' },
};

const colorConfig = {
  primary: {
    iconBg: 'bg-gradient-to-br from-primary-50 to-primary-100',
    iconText: 'text-primary-600',
    border: 'from-primary-500 to-primary-400',
    circle: 'bg-primary-500',
  },
  success: {
    iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    iconText: 'text-emerald-600',
    border: 'from-emerald-500 to-emerald-400',
    circle: 'bg-emerald-500',
  },
  warning: {
    iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    iconText: 'text-amber-600',
    border: 'from-amber-500 to-amber-400',
    circle: 'bg-amber-500',
  },
  danger: {
    iconBg: 'bg-gradient-to-br from-red-50 to-red-100',
    iconText: 'text-red-600',
    border: 'from-red-500 to-red-400',
    circle: 'bg-red-500',
  },
};

export default function Stat({ label, value, change, trend = 'neutral', icon: Icon, prefix, suffix, color = 'primary' }) {
  const trendInfo = trendConfig[trend] || trendConfig.neutral;
  const TrendIcon = trendInfo.icon;
  const colors = colorConfig[color] || colorConfig.primary;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Top gradient border */}
      <div className={clsx('absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r', colors.border)} />

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-4 -top-4">
        <div className={clsx('h-24 w-24 rounded-full opacity-[0.04]', colors.circle)} />
      </div>
      <div className="pointer-events-none absolute -right-2 top-6">
        <div className={clsx('h-16 w-16 rounded-full opacity-[0.03]', colors.circle)} />
      </div>

      <div className="relative flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={clsx('flex h-12 w-12 items-center justify-center rounded-2xl', colors.iconBg)}>
            <Icon className={clsx('h-6 w-6', colors.iconText)} />
          </div>
        )}
      </div>
      <div className="relative mt-3 flex items-baseline gap-1">
        {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
      {change !== undefined && (
        <div className="relative mt-3 flex items-center gap-1.5">
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
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
