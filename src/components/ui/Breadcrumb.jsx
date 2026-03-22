import { Link } from 'react-router-dom'
import { HiOutlineChevronRight } from 'react-icons/hi2'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} className="flex items-center gap-1.5 min-w-0">
            {idx > 0 && <HiOutlineChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
            {isLast ? (
              <span className="font-medium text-slate-900 truncate">{item.label}</span>
            ) : (
              <Link
                to={item.to}
                className="text-slate-500 hover:text-primary-600 transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
