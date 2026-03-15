import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChartBarSquare,
  HiOutlineBuildingLibrary,
  HiOutlineHomeModern,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineDocumentCurrencyEuro,
  HiOutlineBanknotes,
  HiOutlineCog6Tooth,
  HiOutlineBuildingOffice2,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
} from 'react-icons/hi2';

const navItems = [
  { label: 'Tableau de bord', icon: HiOutlineChartBarSquare, to: '/' },
  { label: 'Structures', icon: HiOutlineBuildingLibrary, to: '/structures' },
  { label: 'Biens', icon: HiOutlineHomeModern, to: '/properties' },
  { label: 'Locataires', icon: HiOutlineUsers, to: '/tenants' },
  { label: 'Baux', icon: HiOutlineDocumentText, to: '/leases' },
  { label: 'Facturation', icon: HiOutlineDocumentCurrencyEuro, to: '/invoices' },
  { label: 'Paiements', icon: HiOutlineBanknotes, to: '/payments' },
  { label: 'Parametres', icon: HiOutlineCog6Tooth, to: '/settings' },
];

export default function Sidebar({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <HiOutlineXMark className="h-5 w-5" /> : <HiOutlineBars3 className="h-5 w-5" />}
      </button>

      {/* Backdrop on mobile */}
      <AnimatePresence>
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollapsed(false)}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          collapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-6">
          <HiOutlineBuildingOffice2 className="h-7 w-7 text-primary-400" />
          <span className="text-lg font-bold tracking-tight">GestionLoc</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setCollapsed(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-700/50 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">{user?.name || 'Utilisateur'}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || ''}</p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-white"
              aria-label="Se deconnecter"
            >
              <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
