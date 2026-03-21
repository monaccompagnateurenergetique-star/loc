import { useState } from 'react'
import { clsx } from 'clsx'
import { HiOutlineChevronUp, HiOutlineChevronDown } from 'react-icons/hi2'

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'Aucune donnee trouvee',
  loading = false,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey] ?? ''
        const bVal = b[sortKey] ?? ''
        const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <div className="h-4 w-3/4 rounded-lg skeleton" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-16 text-center">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
                    col.sortable && 'cursor-pointer select-none hover:text-slate-700 transition-colors'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <HiOutlineChevronUp className="h-3 w-3" />
                        : <HiOutlineChevronDown className="h-3 w-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  'border-b border-slate-50 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-primary-50/40'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
