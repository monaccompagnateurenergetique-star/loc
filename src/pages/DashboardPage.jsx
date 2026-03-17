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
  HiOutlineChartBarSquare,
  HiOutlineExclamationCircle,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
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
      className="space-y-8"
    >
      <PageHeader
        title="Tableau de bord"
        subtitle="Bienvenue ! Voici un apercu de votre patrimoine immobilier."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Revenus du mois"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={HiOutlineBanknotes}
          trend="up"
          color="primary"
        />
        <Stat
          label="Encaissements du mois"
          value={formatCurrency(stats.totalCollected || 0)}
          icon={HiOutlineArrowTrendingUp}
          trend="up"
          color="success"
        />
        <Stat
          label="Impayes en cours"
          value={formatCurrency(stats.totalOutstanding || 0)}
          icon={HiOutlineExclamationTriangle}
          trend={stats.totalOutstanding > 0 ? 'down' : 'neutral'}
          color="danger"
        />
        <Stat
          label="Taux d'occupation"
          value={`${stats.occupancyRate || 0} %`}
          icon={HiOutlineChartPie}
          trend="up"
          color="primary"
        />
        <Stat
          label="Baux actifs"
          value={stats.activeLeasesCount || 0}
          icon={HiOutlineDocumentText}
          color="warning"
        />
        <Stat
          label="Biens geres"
          value={properties.length}
          icon={HiOutlineHomeModern}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Bar Chart */}
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <HiOutlineChartBarSquare className="h-5 w-5 text-primary-500" />
            <h3 className="text-sm font-semibold text-slate-900">Revenus par mois</h3>
            <span className="text-xs text-slate-400">(12 derniers mois)</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} \u20AC`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Legend />
                <Bar dataKey="expected" name="Facture" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collected" name="Encaisse" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Occupancy Pie Chart */}
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <HiOutlineChartPie className="h-5 w-5 text-primary-500" />
            <h3 className="text-sm font-semibold text-slate-900">Taux d'occupation</h3>
          </div>
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
          <div className="mb-5 flex items-center gap-2">
            <HiOutlineExclamationCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-semibold text-slate-900">Factures en retard</h3>
            {overdueWithDetails.length > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 px-1.5 text-[11px] font-bold text-red-600">
                {overdueWithDetails.length}
              </span>
            )}
          </div>
          {overdueWithDetails.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <HiOutlineCheckCircle className="mb-3 h-10 w-10 text-emerald-300" />
              <p className="text-sm font-medium text-slate-400">Aucun impaye en cours</p>
              <p className="mt-1 text-xs text-slate-300">Tous les paiements sont a jour</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">Locataire</th>
                    <th className="pb-3 pr-4">Bien</th>
                    <th className="pb-3 pr-4">Montant</th>
                    <th className="pb-3">Retard</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueWithDetails.map((inv, idx) => (
                    <tr
                      key={inv.id}
                      className={`cursor-pointer text-sm transition-colors hover:bg-slate-50 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                      onClick={() => navigate(`/invoices`)}
                    >
                      <td className="rounded-l-lg py-3 pr-4 font-medium text-slate-900">
                        {inv.tenant ? `${inv.tenant.first_name} ${inv.tenant.last_name}` : '-'}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{inv.property?.name || '-'}</td>
                      <td className="py-3 pr-4 font-semibold text-red-600">{formatCurrency(inv.remaining)}</td>
                      <td className="rounded-r-lg py-3">
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
          <div className="mb-5 flex items-center gap-2">
            <HiOutlineCalendarDays className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Baux arrivant a echeance</h3>
            <span className="text-xs text-slate-400">(90 jours)</span>
          </div>
          {expiringWithDetails.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <HiOutlineCheckCircle className="mb-3 h-10 w-10 text-emerald-300" />
              <p className="text-sm font-medium text-slate-400">Aucun bail arrivant a echeance</p>
              <p className="mt-1 text-xs text-slate-300">Pas d'action requise prochainement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringWithDetails.map((lease) => (
                <div
                  key={lease.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => navigate(`/leases/${lease.id}`)}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : '-'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{lease.property?.name || '-'}</p>
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
