export default function PageHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-6">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
