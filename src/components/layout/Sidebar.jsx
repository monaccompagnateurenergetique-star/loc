import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from 'react-icons/hi2';

const mainNavItems = [
  { label: 'Tableau de bord', icon: HiOutlineChartBarSquare, to: '/', exact: true },
  { label: 'Structures', icon: HiOutlineBuildingLibrary, to: '/structures' },
  { label: 'Biens', icon: HiOutlineHomeModern, to: '/properties' },
  { label: 'Locataires', icon: HiOutlineUsers, to: '/tenants' },
  { label: 'Baux', icon: HiOutlineDocumentText, to: '/leases' },
  { label: 'Facturation', icon: HiOutlineReceiptPercent, to: '/invoices' },
  { label: 'Paiements', icon: HiOutlineBanknotes, to: '/payments' },
];

const bottomNavItems = [
  { label: 'Parametres', icon: HiOutlineCog6Tooth, to: '/settings' },
];

export default function Sidebar({ collapsed, onToggleCollapse, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const NavItem = ({ item, isCollapsed }) => {
    const active = isActive(item);
    return (
      <Link
        to={item.to}
        onClick={() => setMobileOpen(false)}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
            : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
        } ${isCollapsed ? 'justify-center px-0' : ''}`}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
        {isCollapsed && (
          <div className="pointer-events-none absolute left-full ml-3 hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl group-hover:block">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  const SidebarContent = ({ isCollapsed }) => (
    <div className="flex h-full flex-col bg-[#0c1222]">
      {/* Logo */}
      <div className={`flex h-[72px] items-center border-b border-white/[0.06] ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-5'}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-lg shadow-primary-600/20">
          <HiOutlineBuildingOffice2 className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight text-white">GestionLoc</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Immobilier</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-6">
        {!isCollapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Menu principal
          </p>
        )}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/[0.06] px-3 pt-3">
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Parametres
          </p>
        )}
        {bottomNavItems.map((item) => (
          <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />
        ))}
      </div>

      {/* User info */}
      <div className="border-t border-white/[0.06] px-3 py-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-violet-500 text-sm font-semibold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-white">{user?.name || 'Utilisateur'}</p>
                <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
              </div>
              <button
                onClick={onLogout}
                className="rounded-lg p-1.5 text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
                aria-label="Se deconnecter"
              >
                <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Collapse Toggle (desktop only, hidden on mobile overlay) */}
      <div className="hidden border-t border-white/[0.06] px-3 py-3 lg:block">
        <button
          onClick={onToggleCollapse}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-300 ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCollapsed ? (
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
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-[#0c1222] p-2.5 text-white shadow-lg lg:hidden"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <HiOutlineXMark className="h-5 w-5" /> : <HiOutlineBars3 className="h-5 w-5" />}
      </button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-[260px] transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isCollapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 z-30 hidden h-screen lg:block"
        style={{
          width: collapsed ? 72 : 260,
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>
    </>
  );
}
