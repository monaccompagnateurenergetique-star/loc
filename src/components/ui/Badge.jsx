import { clsx } from 'clsx'

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  primary: 'bg-primary-50 text-primary-700 ring-primary-200',
}

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-xs',
}

const dotColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
  primary: 'bg-primary-500',
}

export default function Badge({ variant = 'neutral', children, size = 'md', dot = false }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        variantStyles[variant],
        sizeStyles[size]
      )}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}
