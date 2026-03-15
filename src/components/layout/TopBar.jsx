export default function TopBar({ title, subtitle, children }) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{subtitle}</p>
        )}
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
