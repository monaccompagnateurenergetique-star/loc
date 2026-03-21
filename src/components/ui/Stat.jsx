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
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      {/* Top gradient line */}
      <div className={clsx('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', colors.border)} />

      <div className="flex items-start gap-3">
        {Icon && (
          <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', colors.iconBg)}>
            <Icon className={clsx('h-4 w-4', colors.iconText)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-slate-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            {prefix && <span className="text-xs text-slate-500">{prefix}</span>}
            <p className={clsx('font-bold text-slate-900', compact ? 'text-lg' : 'text-xl')}>{value}</p>
            {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
          </div>
          {change !== undefined && (
            <div className="mt-1.5 flex items-center gap-1">
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  trendInfo.bg,
                  trendInfo.color
                )}
              >
                <TrendIcon className="h-2.5 w-2.5" />
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
