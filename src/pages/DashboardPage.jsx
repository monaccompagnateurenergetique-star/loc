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
  HiOutlineArrowRight,
  HiOutlinePlusCircle,
  HiOutlineUserPlus,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2'
import Button from '../components/ui/Button'
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

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444']

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre patrimoine immobilier"
      />

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button variant="secondary" size="sm" icon={HiOutlineBuildingOffice2} onClick={() => navigate('/properties')}>
          Nouveau bien
        </Button>
        <Button variant="secondary" size="sm" icon={HiOutlineUserPlus} onClick={() => navigate('/tenants')}>
          Nouveau locataire
        </Button>
        <Button variant="secondary" size="sm" icon={HiOutlinePlusCircle} onClick={() => navigate('/leases')}>
          Nouveau bail
        </Button>
        <Button variant="secondary" size="sm" icon={HiOutlineDocumentText} onClick={() => navigate('/invoices')}>
          Generer quittances
        </Button>
      </div>

      {/* Stat cards - responsive grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 min-w-0">
        <Stat
          label="Revenus du mois"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={HiOutlineBanknotes}
          trend="up"
          color="primary"
          compact
          onClick={() => navigate('/invoices')}
        />
        <Stat
          label="Encaissements"
          value={formatCurrency(stats.totalCollected || 0)}
          icon={HiOutlineArrowTrendingUp}
          trend="up"
          color="success"
          compact
          onClick={() => navigate('/payments')}
        />
        <Stat
          label="Impayes"
          value={formatCurrency(stats.totalOutstanding || 0)}
          icon={HiOutlineExclamationTriangle}
          trend={stats.totalOutstanding > 0 ? 'down' : 'neutral'}
          color="danger"
          compact
          onClick={() => navigate('/invoices')}
        />
        <Stat
          label="Occupation"
          value={`${stats.occupancyRate || 0}%`}
          icon={HiOutlineChartPie}
          color="primary"
          compact
          onClick={() => navigate('/properties')}
        />
        <Stat
          label="Baux actifs"
          value={stats.activeLeasesCount || 0}
          icon={HiOutlineDocumentText}
          color="warning"
          compact
          onClick={() => navigate('/leases')}
        />
        <Stat
          label="Biens geres"
          value={properties.length}
          icon={HiOutlineHomeModern}
          color="success"
          compact
          onClick={() => navigate('/properties')}
        />
      </div>

      {/* Alerts section - BEFORE charts for clear piloting */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Overdue invoices */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineExclamationCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-semibold text-slate-900">Factures en retard</h3>
              {overdueWithDetails.length > 0 && (
                <Badge variant="danger" size="sm">{overdueWithDetails.length}</Badge>
              )}
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              Voir tout <HiOutlineArrowRight className="h-3 w-3" />
            </button>
          </div>
          {overdueWithDetails.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <HiOutlineCheckCircle className="mb-2 h-10 w-10 text-emerald-300" />
              <p className="text-sm font-medium text-slate-400">Aucun impaye</p>
              <p className="mt-0.5 text-xs text-slate-300">Tous les paiements sont a jour</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdueWithDetails.slice(0, 5).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => navigate('/invoices')}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {inv.tenant ? `${inv.tenant.first_name} ${inv.tenant.last_name}` : '-'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{inv.property?.name || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(inv.remaining)}</span>
                    <Badge variant="danger" size="sm">{inv.daysOverdue}j</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Expiring leases */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineCalendarDays className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">Baux a echeance</h3>
              <span className="text-xs text-slate-400">(90j)</span>
            </div>
            <button
              onClick={() => navigate('/leases')}
              className="text-xs text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1"
            >
              Voir tout <HiOutlineArrowRight className="h-3 w-3" />
            </button>
          </div>
          {expiringWithDetails.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <HiOutlineCheckCircle className="mb-2 h-10 w-10 text-emerald-300" />
              <p className="text-sm font-medium text-slate-400">Aucun bail a echeance</p>
              <p className="mt-0.5 text-xs text-slate-300">Pas d'action requise</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expiringWithDetails.slice(0, 5).map((lease) => (
                <div
                  key={lease.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => navigate(`/leases/${lease.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : '-'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{lease.property?.name || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-slate-500">{formatDate(lease.end_date)}</span>
                    <Badge variant={lease.daysRemaining < 30 ? 'danger' : 'warning'} size="sm">
                      {lease.daysRemaining}j
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineChartBarSquare className="h-5 w-5 text-primary-500" />
              <h3 className="text-sm font-semibold text-slate-900">Revenus mensuels</h3>
            </div>
            <span className="text-xs text-slate-400">12 derniers mois</span>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth || []} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}\u20AC`} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgb(0 0 0 / 0.1)', fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="expected" name="Facture" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Encaisse" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <HiOutlineChartPie className="h-5 w-5 text-primary-500" />
            <h3 className="text-sm font-semibold text-slate-900">Taux d'occupation</h3>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                  {occupancyPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
