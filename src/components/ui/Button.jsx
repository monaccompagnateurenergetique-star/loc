import { clsx } from 'clsx'

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/20',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  children,
  className,
  ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4 shrink-0" />}
    </button>
  )
}
