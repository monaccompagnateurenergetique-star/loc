import { clsx } from 'clsx'
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineMinus } from 'react-icons/hi2'

const trendConfig = {
  up: { icon: HiOutlineArrowTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  down: { icon: HiOutlineArrowTrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
  neutral: { icon: HiOutlineMinus, color: 'text-slate-500', bg: 'bg-slate-50' },
}

const colorConfig = {
  primary: {
    iconBg: 'bg-primary-50',
    iconText: 'text-primary-600',
    border: 'from-primary-500 to-primary-400',
  },
  success: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    border: 'from-emerald-500 to-emerald-400',
  },
  warning: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    border: 'from-amber-500 to-amber-400',
  },
  danger: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
    border: 'from-red-500 to-red-400',
  },
}

export default function Stat({ label, value, change, trend = 'neutral', icon: Icon, prefix, suffix, color = 'primary', compact = false }) {
  const trendInfo = trendConfig[trend] || trendConfig.neutral
  const TrendIcon = trendInfo.icon
  const colors = colorConfig[color] || colorConfig.primary

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      {/* Top gradient line */}
      <div className={clsx('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', colors.border)} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-slate-500 truncate">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            {prefix && <span className="text-sm text-slate-500">{prefix}</span>}
            <p className={clsx('font-bold text-slate-900 truncate', compact ? 'text-xl' : 'text-2xl')}>{value}</p>
            {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
          </div>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                  trendInfo.bg,
                  trendInfo.color
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(change)}%
              </span>
              <span className="text-[11px] text-slate-400">vs mois prec.</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', colors.iconBg)}>
            <Icon className={clsx('h-5 w-5', colors.iconText)} />
          </div>
        )}
      </div>
    </div>
  )
}
