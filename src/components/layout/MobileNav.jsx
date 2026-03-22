import { Link, useLocation } from 'react-router-dom'
import {
  HiOutlineChartBarSquare,
  HiOutlineHomeModern,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineReceiptPercent,
  HiOutlineEllipsisHorizontal,
  HiOutlineBuildingLibrary,
  HiOutlineBanknotes,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const mainItems = [
  { label: 'Accueil', icon: HiOutlineChartBarSquare, to: '/', exact: true },
  { label: 'Biens', icon: HiOutlineHomeModern, to: '/properties' },
  { label: 'Factures', icon: HiOutlineReceiptPercent, to: '/invoices' },
  { label: 'Baux', icon: HiOutlineDocumentText, to: '/leases' },
]

const moreItems = [
  { label: 'Structures', icon: HiOutlineBuildingLibrary, to: '/structures' },
  { label: 'Locataires', icon: HiOutlineUsers, to: '/tenants' },
  { label: 'Paiements', icon: HiOutlineBanknotes, to: '/payments' },
  { label: 'Parametres', icon: HiOutlineCog6Tooth, to: '/settings' },
]

export default function MobileNav() {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-4 pb-8 pt-4 shadow-2xl"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
              <div className="grid grid-cols-2 gap-2">
                {moreItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-4 text-sm font-medium transition-colors ${
                      isActive(item)
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-slate-50 text-slate-700 active:bg-slate-100'
                    }`}
                  >
                    {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-lg mobile-bottom-nav lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
          {mainItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? 'text-primary-600'
                    : 'text-slate-400 active:text-slate-600'
                }`}
              >
                <item.icon className={`h-6 w-6 ${active ? 'text-primary-600' : ''}`} />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-px h-0.5 w-8 rounded-full bg-primary-600"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
          <button
            onClick={() => setShowMore((v) => !v)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
              showMore ? 'text-primary-600' : 'text-slate-400 active:text-slate-600'
            }`}
          >
            <HiOutlineEllipsisHorizontal className="h-6 w-6" />
            <span>Plus</span>
          </button>
        </div>
      </nav>
    </>
  )
}
