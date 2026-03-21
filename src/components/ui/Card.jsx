import { clsx } from 'clsx'

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export default function Card({ children, className, padding = 'md', hover = false, gradient, onClick }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm',
        paddings[padding],
        hover && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300/70',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {gradient && (
        <div className={clsx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', gradient)} />
      )}
      {children}
    </div>
  )
}
