import { clsx } from 'clsx';

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ children, className, padding = 'md', hover = false }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        paddings[padding],
        hover && 'transition-shadow duration-150 hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
}
