import { clsx } from 'clsx';

export default function DatePicker({ label, value, onChange, error, required = false, className, id, ...rest }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        value={value || ''}
        onChange={onChange}
        className={clsx(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
          'transition-colors duration-150',
          'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none',
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
