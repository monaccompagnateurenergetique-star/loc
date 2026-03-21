import { clsx } from 'clsx'

export default function SelectField({
  label,
  options = [],
  error,
  required = false,
  placeholder,
  className,
  id,
  ...rest
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900',
          'transition-all duration-150 appearance-none',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10',
          'focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none',
          error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 hover:border-slate-300',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
