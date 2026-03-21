import { clsx } from 'clsx'

export default function InputField({
  label,
  error,
  helper,
  icon: Icon,
  type = 'text',
  required = false,
  className,
  id,
  size = 'md',
  ...rest
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2.5 text-sm',
  }

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={clsx(
            'block w-full rounded-xl border bg-white text-slate-900 placeholder:text-slate-400',
            'transition-all duration-150',
            'focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none',
            Icon && 'pl-10',
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 hover:border-slate-300',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            sizes[size]
          )}
          {...rest}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  )
}
