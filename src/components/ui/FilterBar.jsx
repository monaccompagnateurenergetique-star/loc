import { useState } from 'react'
import { HiOutlineFunnel, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi2'

export default function FilterBar({ children, activeCount = 0 }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
        >
          <span className="flex items-center gap-2">
            <HiOutlineFunnel className="h-4 w-4 text-slate-400" />
            Filtres
            {activeCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1.5 text-[11px] font-semibold text-primary-700">
                {activeCount}
              </span>
            )}
          </span>
          {open ? <HiOutlineChevronUp className="h-4 w-4" /> : <HiOutlineChevronDown className="h-4 w-4" />}
        </button>
        {open && (
          <div className="mt-2 space-y-3">
            {children}
          </div>
        )}
      </div>

      {/* Desktop: inline */}
      <div className="hidden sm:flex sm:flex-wrap sm:items-end sm:gap-3">
        {children}
      </div>
    </>
  )
}
