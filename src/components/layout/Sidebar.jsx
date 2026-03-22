import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineChartBarSquare,
  HiOutlineBuildingLibrary,
  HiOutlineHomeModern,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineReceiptPercent,
  HiOutlineBanknotes,
  HiOutlineCog6Tooth,
  HiOutlineBuildingOffice2,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from 'react-icons/hi2'

const mainNavItems = [
  { label: 'Tableau de bord', icon: HiOutlineChartBarSquare, to: '/', exact: true },
  { label: 'Structures', icon: HiOutlineBuildingLibrary, to: '/structures' },
  { label: 'Biens', icon: HiOutlineHomeModern, to: '/properties' },
  { label: 'Locataires', icon: HiOutlineUsers, to: '/tenants' },
  { label: 'Baux', icon: HiOutlineDocumentText, to: '/leases' },
  { label: 'Facturation', icon: HiOutlineReceiptPercent, to: '/invoices' },
  { label: 'Paiements', icon: HiOutlineBanknotes, to: '/payments' },
]

const bottomNavItems = [
  { label: 'Parametres', icon: HiOutlineCog6Tooth, to: '/settings' },
]

export default function Sidebar({ collapsed, onToggleCollapse, user, onLogout }) {
  const location = useLocation()

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  const NavItem = ({ item }) => {
    const active = isActive(item)
    return (
      <Link
        to={item.to}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-primary-600/90 to-primary-500/90 text-white shadow-lg shadow-primary-600/20'
            : 'text-slate-400 hover:bg-white/[0.07] hover:text-slate-200'
        } ${collapsed ? 'justify-center px-0' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={`h-[20px] w-[20px] shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
        {collapsed && (
          <div className="pointer-events-none absolute left-full ml-3 hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl group-hover:block z-50">
            {item.label}
          </div>
        )}
      </Link>
    )
  }

  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-screen overflow-hidden lg:block"
      style={{
        width: collapsed ? 72 : 260,
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="flex h-full w-[260px] flex-col" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0c1222 100%)' }}>
        {/* Logo */}
        <div className={`flex h-[68px] items-center border-b border-white/[0.06] ${collapsed ? 'justify-center px-3' : 'gap-3 px-5'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-lg shadow-primary-600/25">
            <HiOutlineBuildingOffice2 className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[15px] font-bold tracking-tight text-white">GestionLoc</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Immobilier</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-4">
          <div className="space-y-0.5">
            {mainNavItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.06] px-3 pt-3">
          {bottomNavItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>

        {/* User info */}
        <div className="border-t border-white/[0.06] px-3 py-3">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-sm font-bold text-white shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user?.name || 'Utilisateur'}</p>
                  <p className="truncate text-[11px] text-slate-500">{user?.email || 'Mode demo'}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
                  title="Se deconnecter"
                >
                  <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className="border-t border-white/[0.06] px-3 py-2">
          <button
            onClick={onToggleCollapse}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300 ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? (
              <HiOutlineChevronDoubleRight className="h-4 w-4" />
            ) : (
              <>
                <HiOutlineChevronDoubleLeft className="h-4 w-4" />
                <span>Reduire</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
