export default function PageHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
