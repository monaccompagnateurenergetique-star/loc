import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
  HiOutlineChartPie,
  HiOutlineDocumentText,
  HiOutlineHomeModern,
} from 'react-icons/hi2'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import PageHeader from '../components/layout/PageHeader'
import Stat from '../components/ui/Stat'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useDashboardStore } from '../store/dashboardStore'
import { usePropertyStore } from '../store/propertyStore'
import { useTenantStore } from '../store/tenantStore'
import { useLeaseStore } from '../store/leaseStore'
import { formatCurrency, formatDate } from '../lib/formatters'

const PIE_COLORS = ['#22c55e', '#eab308', '#ef4444']

export default function DashboardPage() {
  const navigate = useNavigate()
  const { stats, loading, fetchDashboardData } = useDashboardStore()
  const properties = usePropertyStore((s) => s.properties)
  const tenants = useTenantStore((s) => s.tenants)
  const leases = useLeaseStore((s) => s.leases)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const occupancyPieData = useMemo(() => {
    const occupied = properties.filter((p) => p.status === 'occupied').length
    const vacant = properties.filter((p) => p.status === 'vacant').length
    const renovation = properties.filter((p) => p.status === 'renovation').length
    return [
      { name: 'Occupe', value: occupied },
      { name: 'Vacant', value: vacant },
      { name: 'Travaux', value: renovation },
    ].filter((d) => d.value > 0)
  }, [properties])

  const overdueWithDetails = useMemo(() => {
    if (!stats.overdueInvoices) return []
    const today = new Date()
    return stats.overdueInvoices.map((inv) => {
      const tenant = tenants.find((t) => t.id === inv.tenant_id)
      const property = properties.find((p) => p.id === inv.property_id)
      const dueDate = new Date(inv.due_date)
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
      return { ...inv, tenant, property, daysOverdue }
    })
  }, [stats.overdueInvoices, tenants, properties])

  const expiringWithDetails = useMemo(() => {
    if (!stats.expiringLeases) return []
    const today = new Date()
    return stats.expiringLeases.map((lease) => {
      const tenant = tenants.find((t) => t.id === lease.tenant_id)
      const property = properties.find((p) => p.id === lease.property_id)
      const endDate = new Date(lease.end_date)
      const daysRemaining = Math.floor((endDate - today) / (1000 * 60 * 60 * 24))
      return { ...lease, tenant, property, daysRemaining }
    })
  }, [stats.expiringLeases, tenants, properties])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Tableau de bord"
        subtitle="Bienvenue ! Voici un apercu de votre patrimoine immobilier."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Revenus du mois"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={HiOutlineBanknotes}
          trend="up"
        />
        <Stat
          label="Encaissements du mois"
          value={formatCurrency(stats.totalCollected || 0)}
          icon={HiOutlineArrowTrendingUp}
          trend="up"
        />
        <Stat
          label="Impayes en cours"
          value={formatCurrency(stats.totalOutstanding || 0)}
          icon={HiOutlineExclamationTriangle}
          trend={stats.totalOutstanding > 0 ? 'down' : 'neutral'}
        />
        <Stat
          label="Taux d'occupation"
          value={`${stats.occupancyRate || 0} %`}
          icon={HiOutlineChartPie}
          trend="up"
        />
        <Stat
          label="Baux actifs"
          value={stats.activeLeasesCount || 0}
          icon={HiOutlineDocumentText}
        />
        <Stat
          label="Biens geres"
          value={properties.length}
          icon={HiOutlineHomeModern}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Bar Chart */}
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Revenus par mois (12 derniers mois)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} €`} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="expected" name="Facture" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Encaisse" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Occupancy Pie Chart */}
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Taux d'occupation</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {occupancyPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Overdue invoices */}
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Factures en retard</h3>
          {overdueWithDetails.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Aucun impaye en cours</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="pb-2 pr-4">Locataire</th>
                    <th className="pb-2 pr-4">Bien</th>
                    <th className="pb-2 pr-4">Montant</th>
                    <th className="pb-2">Retard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {overdueWithDetails.map((inv) => (
                    <tr
                      key={inv.id}
                      className="cursor-pointer text-sm hover:bg-slate-50"
                      onClick={() => navigate(`/invoices`)}
                    >
                      <td className="py-2 pr-4 font-medium text-slate-900">
                        {inv.tenant ? `${inv.tenant.first_name} ${inv.tenant.last_name}` : '-'}
                      </td>
                      <td className="py-2 pr-4 text-slate-600">{inv.property?.name || '-'}</td>
                      <td className="py-2 pr-4 font-medium text-red-600">{formatCurrency(inv.remaining)}</td>
                      <td className="py-2">
                        <Badge variant="danger">{inv.daysOverdue}j</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Expiring leases */}
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Baux arrivant a echeance (90 jours)</h3>
          {expiringWithDetails.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Aucun bail arrivant a echeance prochainement</p>
          ) : (
            <div className="space-y-3">
              {expiringWithDetails.map((lease) => (
                <div
                  key={lease.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                  onClick={() => navigate(`/leases/${lease.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : '-'}
                    </p>
                    <p className="text-xs text-slate-500">{lease.property?.name || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{formatDate(lease.end_date)}</p>
                    <Badge variant={lease.daysRemaining < 30 ? 'danger' : 'warning'}>
                      {lease.daysRemaining}j restants
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  )
}
