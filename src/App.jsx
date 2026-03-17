import { useEffect, useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import { useAuthStore } from './store/authStore'
import { useStructureStore } from './store/structureStore'
import { usePropertyStore } from './store/propertyStore'
import { useTenantStore } from './store/tenantStore'
import { useLeaseStore } from './store/leaseStore'
import { useInvoiceStore } from './store/invoiceStore'
import { usePaymentStore } from './store/paymentStore'

import DashboardPage from './pages/DashboardPage'
import StructuresPage from './pages/StructuresPage'
import StructureDetailPage from './pages/StructureDetailPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import TenantsPage from './pages/TenantsPage'
import TenantDetailPage from './pages/TenantDetailPage'
import LeasesPage from './pages/LeasesPage'
import LeaseDetailPage from './pages/LeaseDetailPage'
import InvoicesPage from './pages/InvoicesPage'
import PaymentsPage from './pages/PaymentsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const { user, logout } = useAuthStore()
  const fetchStructures = useStructureStore((s) => s.fetchStructures)
  const fetchProperties = usePropertyStore((s) => s.fetchProperties)
  const fetchTenants = useTenantStore((s) => s.fetchTenants)
  const fetchLeases = useLeaseStore((s) => s.fetchLeases)
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices)
  const fetchPayments = usePaymentStore((s) => s.fetchPayments)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }, [])

  useEffect(() => {
    fetchStructures()
    fetchProperties()
    fetchTenants()
    fetchLeases()
    fetchInvoices()
    fetchPayments()
  }, [fetchStructures, fetchProperties, fetchTenants, fetchLeases, fetchInvoices, fetchPayments])

  const sidebarWidth = isDesktop ? (sidebarCollapsed ? 72 : 260) : 0

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        user={user}
        onLogout={logout}
      />

      <div
        className="min-h-screen content-transition"
        style={{ paddingLeft: sidebarWidth }}
      >
        <main style={{ padding: '32px', maxWidth: '1600px' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/structures" element={<StructuresPage />} />
            <Route path="/structures/:id" element={<StructureDetailPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/tenants/:id" element={<TenantDetailPage />} />
            <Route path="/leases" element={<LeasesPage />} />
            <Route path="/leases/:id" element={<LeaseDetailPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
