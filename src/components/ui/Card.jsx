import { clsx } from 'clsx';

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ children, className, padding = 'md', hover = false, gradient }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm',
        paddings[padding],
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      {gradient && (
        <div
          className={clsx(
            'absolute inset-x-0 top-0 h-1',
            gradient
          )}
        />
      )}
      {children}
    </div>
  );
}
